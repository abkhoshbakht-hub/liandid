const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.externalNews.findMany({
  where: { status: 'APPROVED' },
  select: { id: true, title: true, region: true, category: true, topic: true },
  take: 15,
  orderBy: { publishedAt: 'desc' }
}).then(r => {
  console.log(JSON.stringify(r, null, 2));
  p.$disconnect();
});
