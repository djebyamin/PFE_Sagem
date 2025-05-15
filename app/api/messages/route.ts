import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/messages - Récupérer tous les messages
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    const userId = parseInt(decoded.id)

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { expediteurId: userId },
          { conversation: { participants: { some: { utilisateurId: userId } } } }
        ]
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            image: true
          }
        }
      },
      orderBy: {
        date_envoi: 'desc'
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/messages - Envoyer un nouveau message
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
    const senderId = parseInt(decoded.id)

    const { recipientId, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Créer ou récupérer une conversation existante
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { utilisateurId: senderId } } },
          { participants: { some: { utilisateurId: parseInt(recipientId) } } }
        ]
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { utilisateurId: senderId },
              { utilisateurId: parseInt(recipientId) }
            ]
          }
        }
      })
    }

    const message = await prisma.message.create({
      data: {
        contenu: content,
        conversationId: conversation.id,
        expediteurId: senderId
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 