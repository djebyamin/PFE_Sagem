// app/utilisateurs/roles/actions.js
"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function ajouterRole(data: { nom: any; description: any; }) {
  try {
    const role = await prisma.role.create({
      data: {
        nom: data.nom,
        description: data.description || null,
      },
    });

    revalidatePath("/utilisateurs/roles");
    return { success: true, role };
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle:", error);
    throw new Error("Erreur lors de l'ajout du rôle");
  } finally {
    await prisma.$disconnect();
  }
}