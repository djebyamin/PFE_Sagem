// app/utilisateurs/ajouter/action.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { saltAndHashPassword } from '@/app/utils/saltAndHashPassword';

const prisma = new PrismaClient();

// Schéma de validation
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
    // Extraire les données du formulaire
    const rawData = {
      nom: formData.get('nom'),
      prenom: formData.get('prenom'),
      email: formData.get('email'),
      identifiant: formData.get('identifiant'),
      mot_de_passe: formData.get('mot_de_passe'),
      telephone: formData.get('telephone') || null,
      roleId: formData.get('roleId')
    };

    // Valider les données
    const validatedData = utilisateurSchema.parse(rawData);
    
    // Vérifier si l'email ou l'identifiant existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { identifiant: validatedData.identifiant }
        ]
      }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Un utilisateur avec cet email ou cet identifiant existe déjà'
      };
    }

    // Hasher le mot de passe
    const hashedPassword = await saltAndHashPassword(validatedData.mot_de_passe);

    // Créer l'utilisateur dans la base de données
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

    // Revalider le chemin pour mettre à jour les données affichées
    revalidatePath('/utilisateurs');
    
    return {
      success: true,
      userId: newUser.id
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        message: firstError.message || 'Données invalides'
      };
    }
    
    return {
      success: false,
      message: 'Une erreur est survenue lors de la création de l\'utilisateur'
    };
  } finally {
    await prisma.$disconnect();
  }
}