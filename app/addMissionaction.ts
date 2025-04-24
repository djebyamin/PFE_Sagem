"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schéma de validation pour les données entrantes
const MissionSchema = z.object({
  titre: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  client: z.string().min(2, "Le nom du client est requis"),
  date_debut: z.string().optional().nullable(),
  date_fin: z.string().optional().nullable(),
  priorite: z.number().min(1).max(5),
  reference_odoo: z.string().optional(),
  budget: z.number().nonnegative().optional(),
})

// Type pour les données entrantes
type MissionInput = z.infer<typeof MissionSchema>

// Type pour le résultat de l'action
type ActionResult = {
  success: boolean
  message?: string
  error?: string
  data?: any
}

/**
 * Action serveur pour créer une nouvelle mission
 * @param data Les données de la mission à créer
 * @returns Un objet résultat indiquant le succès ou l'échec de l'opération
 */
export async function createMission(data: MissionInput): Promise<ActionResult> {
  try {
    // Valider les données entrantes
    const validatedData = MissionSchema.parse(data)
    
    // ID utilisateur constant numérique
    const TEMP_USER_ID = 3; // Remplacez par un ID valide dans votre base de données
    
    // Créer la mission dans la base de données
    const mission = await prisma.mission.create({
      data: {
        titre: validatedData.titre,
        description: validatedData.description,
        client: validatedData.client,
        date_debut: validatedData.date_debut ? new Date(validatedData.date_debut) : null,
        date_fin: validatedData.date_fin ? new Date(validatedData.date_fin) : null,
        priorite: validatedData.priorite,
        reference_odoo: validatedData.reference_odoo || null,
        budget: validatedData.budget || null,
        // Utiliser un ID utilisateur numérique constant
        createurId: TEMP_USER_ID
      },
    })

    // Revalider le chemin pour mettre à jour l'UI
    revalidatePath("/missions")
    
    return {
      success: true,
      message: "Mission créée avec succès",
      data: mission,
    }
  } catch (error) {
    console.error("Erreur lors de la création de la mission:", error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Données invalides",
        error: JSON.stringify(error.errors),
      }
    }
    
    return {
      success: false,
      message: "Échec de la création de la mission",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}