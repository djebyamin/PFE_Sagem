// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Création d'une instance globale de PrismaClient pour éviter trop de connexions en développement
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = 
  globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;