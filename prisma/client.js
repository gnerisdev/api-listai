// @ts-check
import { PrismaClient } from '@prisma/client';

/** @type {import('@prisma/client').PrismaClient} */
const prisma = globalThis.prisma ?? new PrismaClient();

/** @type {string | undefined} */
const env = process.env.NODE_ENV;

if (env !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
