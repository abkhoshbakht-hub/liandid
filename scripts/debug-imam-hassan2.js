const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const rows = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { title: { contains: 'بندر امام حسن' } },
        { description: { contains: 'بندر امام حسن' } },
      ],
    },
    select: { id: true, title: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('=== rows with "بندر امام حسن":', rows.length, '===');
  for (const r of rows) console.log(' -', r.title.slice(0, 80));

  const rows2 = await p.externalNews.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { title: { contains: 'امام حسن' } },
        { description: { contains: 'امام حسن' } },
      ],
    },
    select: { id: true, title: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });
  const nonImam = rows2.filter(r => !/امام حسن\s*(?:مجتبی|\(ع\)|ع)/.test(r.title) && !r.title.includes('صلح امام حسن'));
  console.log('\n=== "امام حسن" غیرامامی:', nonImam.length, '===');
  for (const r of nonImam) console.log(' -', r.title.slice(0, 80));
  await p.$disconnect();
})();