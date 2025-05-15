'use server'

import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function addParticipantToConversation(conversationId: string, utilisateurId: string, token: string) {
  const expediteur = await verifyToken(token)
  if (!expediteur) throw new Error('Utilisateur non authentifié')

  // Vérifier si l'utilisateur fait déjà partie de la conversation
  const existingParticipant = await prisma.participant.findUnique({
    where: {
      conversationId_utilisateurId: {
        conversationId: Number(conversationId),
        utilisateurId: Number(utilisateurId),
      },
    },
  })

  if (existingParticipant) {
    throw new Error('L\'utilisateur est déjà dans cette conversation')
  }

  // Ajouter le participant
  const newParticipant = await prisma.participant.create({
    data: {
      conversationId: Number(conversationId),
      utilisateurId: Number(utilisateurId),
    },
  })

  return newParticipant
}
