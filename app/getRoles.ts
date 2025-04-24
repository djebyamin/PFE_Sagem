// lib/getRoles.ts
import { prisma } from "@/lib/prisma";

export async function getRoles() {
  return await prisma.role.findMany({
    select: {
      id: true,
      nom: true,
    },
  });
}
