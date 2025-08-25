require('dotenv').config({ path: '.env' });

const mask = (s='') => s.replace(/\/\/([^:]+):([^@]+)@/, (_,u,p)=>`//${u}:****@`);
console.log('DATABASE_URL:', mask(process.env.DATABASE_URL));

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

(async () => {
  try {
    const now = await prisma.$queryRaw`select now() as now`;
    const count = await prisma.projectActivity.count();
    console.log('now:', now);
    console.log('projectActivity count:', count);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
