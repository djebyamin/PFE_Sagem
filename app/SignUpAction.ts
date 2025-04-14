'use server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Fonction pour hacher le mot de passe
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Fonction de création de l'utilisateur
export async function signup(data: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  identifiant: string;
  telephone: string | null;
}) {
  const { nom, prenom, email, password, identifiant, telephone } = data;

  // Vérifier si l'email ou l'identifiant existe déjà dans la base de données
  const existingUser = await prisma.utilisateur.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  const existingIdentifiant = await prisma.utilisateur.findUnique({
    where: { identifiant },
  });

  if (existingIdentifiant) {
    throw new Error("L'identifiant est déjà pris.");
  }

  // Hacher le mot de passe
  const hashedPassword = await hashPassword(password);

  // Créer un nouvel utilisateur avec le rôle "USER"
  const newuser = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      identifiant,
      telephone,
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { nom: 'USER' },        // doit être @unique dans le modèle Role
              create: { nom: 'USER' },       // sera créé si inexistant
            },
          },
        },
      },
    },
  });

  return newuser;
}
