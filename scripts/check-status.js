const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  // Check what sources exist
  const sources = await p.externalNews.groupBy({ by: ['sourceName'], _count: true, orderBy: { _count: { sourceName: 'desc' } } });
  console.log('Sources:');
  sources.forEach(s => console.log(`  ${s.sourceName}: ${s._count}`));
  
  // Check Bushehr news
  const bushehr = await p.externalNews.findMany({ where: { OR: [{ sourceName: { contains: 'بوشهر' } }, { sourceName: { contains: 'خلیج' } }, { sourceName: { contains: 'عصر' } }] }, take: 5, select: { title: true, image: true, sourceName: true, status: true } });
  console.log('\nBushehr news:');
  bushehr.forEach(n => console.log(`  [${n.status}] ${n.sourceName}: ${n.title.substring(0,40)} img:${(n.image||'').substring(0,60)}`));
  
  // Check all with real images
  const withImg = await p.externalNews.findMany({ where: { AND: [{ image: { not: '' } }, { image: { not: null } }] }, select: { id: true, image: true, sourceName: true } });
  const irnaImgs = withImg.filter(n => n.image.includes('irna'));
  const otherImgs = withImg.filter(n => !n.image.includes('irna') && !n.image.includes('unsplash'));
  console.log(`\nImages: ${withImg.length} total, ${irnaImgs.length} IRNA, ${otherImgs.length} other`);
  if (otherImgs.length > 0) otherImgs.slice(0, 3).forEach(n => console.log(`  ${n.sourceName}: ${n.image.substring(0,100)}`));
  
  await p.$disconnect();
}
main();
