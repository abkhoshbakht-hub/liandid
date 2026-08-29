const { PrismaClient } = require('@prisma/client');
const { detectRegion } = require('../src/lib/regions-core.js');
const p = new PrismaClient();
(async () => {
  const rows = await p.externalNews.findMany({
    where: { status: 'APPROVED', title: { contains: 'امام حسن' } },
    select: { id: true, title: true, region: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('=== rows with "امام حسن" now:', rows.length, '===');
  for (const r of rows) {
    const det = detectRegion({ title: r.title, description: '' });
    console.log('region:', r.region, '| detect:', det, '|', r.title.slice(0, 70));
  }
  const bad = rows.filter(r => r.region === 'deylam:city');
  console.log('\nstill wrongly deylam:city:', bad.length);
  const deylamCity = await p.externalNews.findMany({ where: { status: 'APPROVED', region: 'deylam:city' }, select: { title: true } });
  console.log('deylam:city news now:', deylamCity.length);
  for (const d of deylamCity) console.log(' -', d.title.slice(0, 70));
  await p.$disconnect();
})();