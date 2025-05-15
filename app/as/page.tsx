import { prisma } from "@/lib/prisma"
import { updateMissionStatus } from "./actions"
import { StatutMission } from "@prisma/client"

import { RocketIcon, AlertTriangle, Clock, BadgeCheck } from "lucide-react"

export default async function MissionsPage() {
  const missions = await prisma.mission.findMany({
    orderBy: { date_creation: "desc" },
  })

  const getPrioriteStyle = (priorite: number) => {
    if (priorite >= 5) return "bg-red-600 text-white";
    if (priorite === 4) return "bg-orange-500 text-white";
    if (priorite === 3) return "bg-yellow-400 text-black";
    if (priorite === 2) return "bg-green-300 text-black";
    return "bg-gray-200 text-black";
  }

  const getPrioriteLabel = (priorite: number) => {
    const labels = {
      1: "Très faible",
      2: "Faible",
      3: "Moyenne",
      4: "Haute",
      5: "Critique"
    }
    return labels[priorite as keyof typeof labels] ?? "Inconnue"
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
        <RocketIcon className="w-8 h-8 text-blue-600" />
        Missions en cours
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{mission.titre}</h2>
              {mission.priorite && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPrioriteStyle(mission.priorite)}`}
                >
                  {getPrioriteLabel(mission.priorite)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mt-3 mb-4 text-sm leading-relaxed">
              {mission.description}
            </p>

            {/* Statut */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <BadgeCheck className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-800">Statut :</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                {mission.statut}
              </span>
            </div>

            {/* Countdown */}
            {mission.statut === "PLANIFIEE" && mission.date_debut && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Form */}
            <form
              action={updateMissionStatus}
              className="mt-auto pt-4 border-t border-gray-200 flex items-center gap-3"
            >
              <input type="hidden" name="id" value={mission.id} />
              <select
                name="statut"
                defaultValue={mission.statut}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.values(StatutMission).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition"
              >
                Modifier
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
