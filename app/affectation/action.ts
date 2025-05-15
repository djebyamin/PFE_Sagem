// app/actions/affecterMission.ts
'use server'

import { prisma } from '@/lib/prisma'

export async function affecterMission(missionId: number, utilisateurId: number) {
  try {
    // 1. Récupérer le rôle de l'utilisateur
    const roleUtilisateur = await prisma.roleUtilisateur.findFirst({
      where: { utilisateurId },
      include: { role: true },
    });

    if (!roleUtilisateur) {
      throw new Error("Rôle utilisateur introuvable");
    }

    // 2. Créer l'affectation
    await prisma.affectation.create({
      data: {
        missionId,
        utilisateurId,
        role_mission: roleUtilisateur.role.nom,
      },
    });

    // 3. Mettre à jour le statut de la mission
    await prisma.mission.update({
      where: { id: missionId },
      data: { statut: 'AFFECTEE' }, // Utilise bien la majuscule exacte définie dans l’enum
    });

  } catch (error) {
    console.error("Erreur d'affectation :", error);
    throw new Error("Échec de l'affectation");
  }
}
