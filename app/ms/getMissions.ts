// actions/getMissions.ts
'use server'

import { prisma } from "@/lib/prisma";

export async function getMissionsAvecAffectations() {
  const missions = await prisma.mission.findMany({
    include: {
      affectations: {
        include: {
          utilisateur: true,
        }
      }
    },
    orderBy: {
      date_creation: 'desc',
    },
  });

  return missions;
}
