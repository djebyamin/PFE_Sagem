// app/affectation/page.tsx
import { prisma } from '@/lib/prisma'
import { affecterMission } from '../affectation/action'
import { revalidatePath } from 'next/cache'

export default async function AffectationPage() {
  const missions = await prisma.mission.findMany({
    include: { affectations: true },
  })

  const utilisateurs = await prisma.utilisateur.findMany({
    select: { id: true, nom: true, prenom: true },
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Affecter des Missions</h1>

      {missions.map((mission) => (
        <div key={mission.id} className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">{mission.titre}</h2>
          <p className="text-sm text-gray-600">{mission.description}</p>

          <div className="mt-4">
            <p className="font-medium">Assigner à :</p>
            <ul className="flex flex-wrap gap-2 mt-2">
              {utilisateurs.map((user) => (
                <form
                  key={user.id}
                  action={async () => {
                    'use server'
                    await affecterMission(mission.id, user.id)
                    revalidatePath('/affectation') // Recharger les données
                  }}
                >
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {user.nom} {user.prenom}
                  </button>
                </form>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
