"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
  revalidatePath('/technicien')
  return message
}

// Ajoute cette server action pour récupérer tous les utilisateurs
export async function getAllUtilisateurs() {
  return await prisma.utilisateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      identifiant: true,
      image: true,
    }
  })
}

export async function getReceivedMessages(userId: number) {
  try {
    const messages = await prisma.message.findMany({
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
          include: {
            participants: true
          }
        }
      }
    })
    return messages
  } catch (error) {
    console.error('Erreur lors de la récupération des messages reçus:', error)
    throw error
  }
}

export async function markMessageAsRead(messageId: number) {
  try {
    await prisma.message.update({
      where: {
        id: messageId
      },
      data: {
        lu: true
      }
    })
    revalidatePath('/technicien')
    revalidatePath('/manager')
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error)
    throw error
  }
}

export async function getAffectationsTechnicien(utilisateurId: number) {
  try {
    const affectations = await prisma.affectation.findMany({
      where: {
        utilisateurId: utilisateurId,
        mission: {
          statut: {
            not: 'ARCHIVEE' // Exclure les missions archivées
          }
        }
      },
      include: {
        mission: {
          select: {
            id: true,
            titre: true,
            description: true,
            date_creation: true,
            date_debut: true,
            date_fin: true,
            statut: true,
            priorite: true,
            client: true,
            reference_odoo: true,
            budget: true
          }
        }
      },
      orderBy: [
        {
          mission: {
            priorite: 'asc' // Trier par priorité (la plus haute en premier)
          }
        },
        {
          date_affectation: 'desc' // Puis par date d'affectation
        }
      ]
    })

    return affectations
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error)
    throw error
  }
} 