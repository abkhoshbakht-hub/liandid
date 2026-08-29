const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      title: { contains: 'امام حسن' },
    },
    select: { id: true, title: true, description: true, region: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('=== rows with "امام حسن":', rows.length, '===');
  for (const r of rows) {
    console.log('region:', r.region, '|', r.title.slice(0, 80));
  }
  await p.$disconnect();
})();