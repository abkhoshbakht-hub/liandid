const { PrismaClient } = require('@prisma/client');
const { detectRegion } = require('../src/lib/regions-core.js');
const p = new PrismaClient();

async function main() {
  const dayer = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      title: { contains: 'دیر' },
    },
    select: { id: true, title: true, region: true, status: true },
  });
  console.log('dayer news count:', dayer.length);
  for (const n of dayer.slice(0, 20)) {
    const r = detectRegion({ title: n.title, description: '' });
    console.log('=>', n.title.slice(0, 60), '| region:', n.region, '| detect:', r);
  }
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });