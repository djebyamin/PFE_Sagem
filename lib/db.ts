import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global prisma to be reused across hot reloads in development
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export const db = prisma;
