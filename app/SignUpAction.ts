'use server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Function to hash the password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// User creation function
export async function signup(data: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  identifiant: string;
  telephone: string | null;
}) {
  const { nom, prenom, email, password, identifiant, telephone } = data;

  try {
    // Check if email already exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    // Check if identifier already exists
    const existingIdentifiant = await prisma.utilisateur.findUnique({
      where: { identifiant },
    });

    if (existingIdentifiant) {
      throw new Error("L'identifiant est déjà pris.");
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user with "USER" role
    const newUser = await prisma.utilisateur.create({
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
                where: { nom: 'USER' },
                create: { nom: 'USER' },
              },
            },
          },
        },
      },
    });

    return newUser;

  } catch (error) {
    // Log error for debugging purposes
    console.error(error);
    throw new Error('Erreur lors de la création de l\'utilisateur.');
  }
}
