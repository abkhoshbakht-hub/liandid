const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Delete all seed news (liandid source with broken Unsplash images)
  const deleted = await p.externalNews.deleteMany({ where: { source: 'liandid' } });
  console.log(`Deleted ${deleted.count} seed news`);
  
  // 2. Delete all homepage slots
  await p.homepageSlot.deleteMany();
  console.log('Deleted homepage slots');
  
  // 3. Count RSS news
  const total = await p.externalNews.count();
  const pending = await p.externalNews.count({ where: { status: 'PENDING' } });
  const withImages = await p.externalNews.count({ where: { image: { not: '' }, image: { not: null } } });
  console.log(`Total RSS news: ${total}, Pending: ${pending}, With images: ${withImages}`);
  
  // 4. Show some with images
  const samples = await p.externalNews.findMany({ where: { image: { not: '' }, image: { not: null } }, take: 5, select: { title: true, image: true, sourceName: true } });
  console.log('\nSamples with images:');
  samples.forEach(s => console.log(`  ${s.sourceName}: ${s.title.substring(0,40)}\n    ${s.image.substring(0,100)}`));
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
