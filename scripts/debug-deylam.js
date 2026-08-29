const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.externalNews.findMany({
    where: { status: 'APPROVED', OR: [{ title: { contains: 'دیلم' } }, { description: { contains: 'دیلم' } }] },
    select: { id: true, title: true, description: true, region: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('=== rows with "دیلم":', rows.length, '===');
  for (const r of rows) console.log('region:', r.region, '|', r.title.slice(0, 75));
  await p.$disconnect();
})();