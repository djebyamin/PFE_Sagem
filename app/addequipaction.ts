'use server'

import { prisma } from "@/lib/prisma"
import { z } from "zod"

const equipementSchema = z.object({
  code_imo: z.string().min(1),
  nom_testeur: z.string().min(1),
  nom_equipement: z.string().min(1),
  designation: z.string().min(1),
  categorie: z.string().min(1),
  nombre: z.coerce.number().min(1),
  date_mise_en_marche: z.date().optional(),
  date_garantie: z.date().optional(),
})

export async function ajouterEquipement(data: unknown) {
  const parsed = equipementSchema.safeParse(data)

  if (!parsed.success) {
    console.error(parsed.error)
    throw new Error("Validation échouée")
  }

  const existing = await prisma.equipement.findUnique({
    where: { code_imo: parsed.data.code_imo },
  })

  if (existing) {
    // On ajoute la nouvelle quantité au nombre existant
    const updated = await prisma.equipement.update({
      where: { code_imo: parsed.data.code_imo },
      data: {
        nombre: existing.nombre + parsed.data.nombre, // Ajout de la quantité
      },
    })
    return updated
  } else {
    // Insertion d'un nouvel équipement
    const created = await prisma.equipement.create({
      data: parsed.data,
    })
    return created
  }
}
