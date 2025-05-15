'use server'
import prisma from '@/lib/prisma'

export async function getUserConversations(utilisateurId: number) {
  return prisma.conversation.findMany({
    where: {
      participants: {
        some: { utilisateurId },
      },
    },
    include: {
      participants: { include: { utilisateur: true } },
      messages: { orderBy: { date_envoi: 'desc' }, take: 1 },
    },
    orderBy: { date_creation: 'desc' },
  })
}

export async function getConversationMessages(conversationId: number) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { date_envoi: 'asc' },
    include: { expediteur: true },
  })
}

export async function sendMessage(conversationId: number, expediteurId: number, contenu: string, pieceJointeUrl?: string) {
  return prisma.message.create({
    data: {
      conversationId,
      expediteurId,
      contenu,
      pieceJointeUrl,
    },
  })
} 