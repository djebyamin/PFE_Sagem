"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Récupère la liste des utilisateurs
export async function getUtilisateurs() {
  return await prisma.utilisateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      identifiant: true,
      image: true,
    },
  })
}

// Récupère ou crée une conversation entre deux utilisateurs
export async function getOrCreateConversation(userId: number, otherUserId: number) {
  // Cherche une conversation existante entre les deux utilisateurs
  let conversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          utilisateurId: { in: [userId, otherUserId] },
        },
      },
      AND: {
        participants: {
          some: {
            utilisateurId: userId,
          },
        },
      },
    },
    include: {
      participants: true,
    },
  })

  if (!conversation) {
    // Crée la conversation et ajoute les deux participants
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { utilisateur: { connect: { id: userId } } },
            { utilisateur: { connect: { id: otherUserId } } },
          ],
        },
      },
      include: {
        participants: true,
      },
    })
  }
  return conversation
}

// Récupère les messages d'une conversation
export async function getMessages(conversationId: number) {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { date_envoi: 'asc' },
    include: {
      expediteur: {
        select: { id: true, nom: true, prenom: true, image: true },
      },
    },
  })
}

// Envoie un message dans une conversation
export async function sendMessage({
  conversationId,
  expediteurId,
  contenu,
}: {
  conversationId: number
  expediteurId: number
  contenu: string
}) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      expediteurId,
      contenu,
    },
    include: {
      expediteur: {
        select: { id: true, nom: true, prenom: true, image: true },
      },
    },
  })
  revalidatePath('/manager')
  return message
}

// Récupère les messages reçus pour un utilisateur
export async function getReceivedMessages(userId: number) {
  return await prisma.message.findMany({
    where: {
      conversation: {
        participants: {
          some: {
            utilisateurId: userId
          }
        }
      },
      expediteurId: {
        not: userId
      },
      lu: false
    },
    orderBy: {
      date_envoi: 'desc'
    },
    include: {
      expediteur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          image: true
        }
      },
      conversation: {
        select: {
          id: true,
          participants: {
            select: {
              utilisateur: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true
                }
              }
            }
          }
        }
      }
    }
  })
}

// Marquer un message comme lu
export async function markMessageAsRead(messageId: number) {
  await prisma.message.update({
    where: { id: messageId },
    data: { lu: true }
  })
  revalidatePath('/manager')
  revalidatePath('/technicien')
} 