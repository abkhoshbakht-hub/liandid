const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const all = await p.externalNews.findMany({ where: { status: 'APPROVED' }, select: { id: true, title: true, region: true, category: true, topic: true } });
  console.log('total approved:', all.length);

  const dayer = all.filter(n => n.title.includes('دیر'));
  console.log('\n=== dayer contains ===', dayer.length);
  const badPat = /غدیر|مدیر|تاخیر|تأخیر|دیروز|دیرهنگام|امدادی|بهداشتی|تدارک|آماده|دیرین|پدیر|فدیر|سپیدرود|دیرکرد|سردیر|خدیر/;
  const dayerBad = dayer.filter(n => badPat.test(n.title));
  console.log('dayer FALSE positives:', dayerBad.length);
  dayerBad.slice(0, 15).forEach(n => console.log('  BAD:', n.title.slice(0, 75)));

  const withRegion = all.filter(n => n.region);
  console.log('\n=== region assigned ===', withRegion.length);
  const byRegion = {};
  withRegion.forEach(n => { byRegion[n.region] = (byRegion[n.region] || 0) + 1; });
  console.log(byRegion);

  const withTopic = all.filter(n => n.topic);
  console.log('\n=== topic assigned ===', withTopic.length);
  const byTopic = {};
  withTopic.forEach(n => { byTopic[n.topic] = (byTopic[n.topic] || 0) + 1; });
  console.log(byTopic);

  const byCat = {};
  all.forEach(n => { const c = n.category || 'null'; byCat[c] = (byCat[c] || 0) + 1; });
  console.log('\n=== by category ===', byCat);

  await p.$disconnect();
})();
