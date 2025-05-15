'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saltAndHashPassword } from '@/app/utils/saltAndHashPassword';
import { createPartnerInOdoo } from '@/app/utils/odooService';

const prisma = new PrismaClient();

const utilisateurSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  email: z.string().email('Email invalide'),
  identifiant: z.string().min(1, 'L\'identifiant est obligatoire'),
  mot_de_passe: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  telephone: z.string().optional().nullable(),
  roleId: z.string().min(1, 'Sélectionnez un rôle')
});

export async function ajouterUtilisateur(formData: FormData) {
  try {
    const rawData = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      identifiant: formData.get('identifiant'),
      mot_de_passe: formData.get('mot_de_passe'),
      telephone: formData.get('telephone') || null,
      roleId: formData.get('roleId')
    };

    const validatedData = utilisateurSchema.parse(rawData);

    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { identifiant: validatedData.identifiant }
        ]
      }
    });

    if (existingUser) {
      return { success: false, message: 'Cet utilisateur existe déjà' };
    }

    const hashedPassword = await saltAndHashPassword(validatedData.mot_de_passe);

    const newUser = await prisma.utilisateur.create({
      data: {
        nom: validatedData.nom,
        prenom: validatedData.prenom,
        email: validatedData.email,
        identifiant: validatedData.identifiant,
        mot_de_passe: hashedPassword,
        telephone: validatedData.telephone,
        actif: true,
        roles: {
          create: {
            roleId: parseInt(validatedData.roleId),
            date_attribution: new Date()
          }
        }
      }
    });

    // Création dans Odoo
    try {
      await createPartnerInOdoo(
        `${validatedData.prenom} ${validatedData.nom}`,
        validatedData.email,
        validatedData.telephone
      );
      console.log('Partenaire créé dans Odoo');
    } catch (odooErr) {
      console.error('Erreur Odoo :', odooErr);
    }

    revalidatePath('/utilisateurs');
    return { success: true, userId: newUser.id };

  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'Erreur lors de la création' };
  } finally {
    await prisma.$disconnect();
  }
}
