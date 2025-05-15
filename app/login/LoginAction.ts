'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

// Définition des types pour plus de sécurité
interface LoginData {
  identifiant: string
  mot_de_passe: string
}

// Type pour les données du token
export default interface TokenData {
  id: number
  nom: string
  prenom: string
  email: string
  identifiant: string
  roles: string[]
}

export async function loginAction(data: LoginData) {
  try {
    // Récupérer l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { identifiant: data.identifiant },
    })

    if (!user || !user.mot_de_passe) {
      return { error: 'Identifiant ou mot de passe incorrect' }
    }

    const passwordValid = await bcrypt.compare(data.mot_de_passe, user.mot_de_passe)
    if (!passwordValid) {
      return { error: 'Identifiant ou mot de passe incorrect' }
    }

    // Récupérer les rôles de l'utilisateur
    const userRoles = await prisma.roleUtilisateur.findMany({
      where: {
        utilisateurId: user.id
      },
      include: {
        role: true
      }
    })

    if (!userRoles || userRoles.length === 0) {
      return { error: 'Aucun rôle trouvé pour cet utilisateur' }
    }

    // Extraire les noms des rôles
    const roles = userRoles.map(ru => ru.role.nom)

    // Créer les données du token
    const tokenData: TokenData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      identifiant: user.identifiant,
      roles: roles
    }

    // Générer le token
    const jwtToken = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '7d' })
    console.log('Token généré:', jwtToken)

    // Stocker le token dans un cookie sécurisé
    const cookieStore = cookies()
    ;(await cookieStore).set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Redirection selon le rôle
    if (roles.includes('technicien')) {
      return { redirectTo: '/technicien' }
    } else if (roles.includes('manager')) {
      return { redirectTo: '/manager' }
    } else {
      return { error: 'Aucun rôle valide pour la redirection' }
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    return { error: 'Erreur lors de la connexion' }
  }
}
