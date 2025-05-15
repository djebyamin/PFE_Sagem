import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import TechnicienComponent from "./techniciencomponant"
import { getAffectationsTechnicien } from "./actions"

export default async function TechnicienPage() {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = await verifyToken(token)

  if (!user) {
    redirect('/login')
  }

  // Vérifier si l'utilisateur est un technicien
  const isTechnician = user.roles?.includes('technicien')
  if (!isTechnician) {
    redirect('/login')
  }

  // Récupérer tous les utilisateurs
  const utilisateurs = await prisma.utilisateur.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      identifiant: true,
      image: true
    }
  })

  // Récupérer les affectations du technicien
  const affectations = await getAffectationsTechnicien(Number(user.id))

  // Transformer les affectations pour correspondre au type attendu
  const formattedAffectations = affectations.map(affectation => ({
    id: affectation.id,
    date_affectation: affectation.date_affectation,
    role_mission: affectation.role_mission,
    commentaire: affectation.commentaire || undefined,
    mission: {
      id: affectation.mission.id,
      titre: affectation.mission.titre,
      description: affectation.mission.description || undefined,
      date_creation: affectation.mission.date_creation,
      date_debut: affectation.mission.date_debut || undefined,
      date_fin: affectation.mission.date_fin || undefined,
      statut: affectation.mission.statut,
      priorite: affectation.mission.priorite,
      client: affectation.mission.client || undefined,
      reference_odoo: affectation.mission.reference_odoo || undefined,
      budget: affectation.mission.budget || undefined
    }
  }))

  return (
    <TechnicienComponent
      user={user}
      utilisateurs={utilisateurs}
      affectations={formattedAffectations}
    />
  )
}
