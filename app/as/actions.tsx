// app/missions/actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { StatutMission } from "@prisma/client"

export async function updateMissionStatus(formData: FormData) {
  const id = Number(formData.get("id"))
  const statut = formData.get("statut") as StatutMission

  if (!id || !statut) return

  await prisma.mission.update({
    where: { id },
    data: { statut },
  })

  revalidatePath("/missions")
}
