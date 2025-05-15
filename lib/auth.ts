import jwt from 'jsonwebtoken'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt'

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as {
      id: string
      email: string
      nom: string
      prenom: string
      identifiant: string
      roles: string[]
      iat: number
      exp: number
    }
  } catch (error) {
    console.error('Erreur de vérification du token :', error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.utilisateur.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        })

        if (!user || !user.mot_de_passe) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.mot_de_passe)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          roles: user.roles.map(r => r.role.nom)
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.roles = token.roles
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
