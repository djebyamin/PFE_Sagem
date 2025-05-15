"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function updateEquipmentStock(items: Array<{id: number, quantity: number}>) {
  try {
    // Utilisation d'une transaction pour garantir l'intégrité des données
    const result = await prisma.$transaction(
      items.map(item => 
        prisma.equipement.update({
          where: { id: item.id },
          data: {
            // Soustraire la quantité commandée du stock actuel
            nombre: {
              decrement: item.quantity
            }
          }
        })
      )
    )
    
    return { success: true, updatedItems: result }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stock:", error)
    return { success: false, error: "Échec de la mise à jour du stock" }
  }
}

// Fonction pour récupérer les équipements mis à jour
export async function getUpdatedEquipments(ids: number[]) {
  try {
    const updatedEquipments = await prisma.equipement.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })
    
    return updatedEquipments
  } catch (error) {
    console.error("Erreur lors de la récupération des équipements:", error)
    return []
  }
}