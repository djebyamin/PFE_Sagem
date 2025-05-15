import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// Marquer un message comme lu
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (decoded === undefined) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const messageId = parseInt(params.id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'ID de message invalide' }, { status: 400 })
    }

    const message = await prisma.message.update({
      where: {
        id: messageId
      },
      data: {
        lu: true
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 

function verifyToken(token: string) {
  throw new Error('Function not implemented.')
}
