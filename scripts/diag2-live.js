const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const notopic = await p.externalNews.findMany({
    where: { status: 'APPROVED', topic: null },
    select: { id: true, title: true, description: true, category: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('=== no topic', notopic.length, '===');
  notopic.slice(0, 40).forEach(n => console.log(' -', (n.category||'').padEnd(8), n.title.slice(0, 80)));

  const mobile = await p.externalNews.findMany({ where: { topic: 'mobile' }, select: { title: true } });
  console.log('\n=== mobile', mobile.length, '===');
  mobile.forEach(n => console.log(' -', n.title.slice(0, 70)));

  const rahbari = await p.externalNews.findMany({ where: { topic: 'rahbari' }, select: { title: true } });
  console.log('\n=== rahbari', rahbari.length, '===');
  rahbari.forEach(n => console.log(' -', n.title.slice(0, 70)));

  const bushehrAll = await p.externalNews.findMany({
    where: { status: 'APPROVED', category: 'بوشهر' },
    select: { id: true, title: true, topic: true, category: true },
    orderBy: { publishedAt: 'desc' },
  });
  console.log('\n=== bushehr content', bushehrAll.length, '===');
  bushehrAll.slice(0, 25).forEach(n => console.log(' - topic:', (n.topic||'-').padEnd(16), n.title.slice(0, 70)));

  await p.$disconnect();
})();