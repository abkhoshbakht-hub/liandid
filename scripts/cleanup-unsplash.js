const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Delete all news with Unsplash images (blocked in Iran)
  const deleted = await p.externalNews.deleteMany({
    where: { image: { contains: 'unsplash' } }
  });
  console.log(`Deleted ${deleted.count} news with Unsplash images`);

  // Count remaining
  const total = await p.externalNews.count();
  const withImg = await p.externalNews.count({ where: { AND: [{ image: { not: null } }, { image: { not: '' } }] } });
  const withoutImg = await p.externalNews.count({ where: { OR: [{ image: null }, { image: '' }] } });
  console.log(`Remaining: ${total} total, ${withImg} with images, ${withoutImg} without images`);
  
  // Show some with real images
  const samples = await p.externalNews.findMany({ where: { AND: [{ image: { not: null } }, { image: { not: '' } }, { image: { not: { contains: 'unsplash' } } }] }, take: 5, select: { title: true, image: true, sourceName: true } });
  console.log('\nReal images:');
  samples.forEach(s => console.log(`  ${s.sourceName}: ${s.title.substring(0,40)}\n    ${s.image.substring(0,120)}`));
  
  // Show some without images
  const noImg = await p.externalNews.findMany({ where: { OR: [{ image: null }, { image: '' }] }, take: 3, select: { title: true, sourceName: true } });
  console.log('\nWithout images:');
  noImg.forEach(s => console.log(`  ${s.sourceName}: ${s.title.substring(0,50)}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
