import NextAuth from "next-auth"
import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"
import { saltAndHashPassword } from "@/app/utils/saltAndHashPassword"
import { getUserFromDb } from "@/app/utils/db"

// Définition du type User pour correspondre au format attendu par NextAuth
export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password } = await signInSchema.parseAsync(credentials)

          // logic to salt and hash password
          const pwHash = saltAndHashPassword(password)

          // logic to verify if the user exists
          const user = await getUserFromDb(email)

          if (!user) {
            return null
          }

          // Transformer l'utilisateur au format attendu par NextAuth
          return {
            id: String(user.id), // NextAuth attend un id de type string
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
            image: user.image || undefined,
            // Autres champs que vous souhaitez inclure dans la session
          }
        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }
          throw error // Rethrow other errors
        }
      },
    }),
  ],
})