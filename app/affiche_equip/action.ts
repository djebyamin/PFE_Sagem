'use server'
import { prisma } from "@/lib/prisma"

export async function getEquipements() {
  return await prisma.equipement.findMany()
}
