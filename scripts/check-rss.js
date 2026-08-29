const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const rss = await p.externalNews.findMany({ where: { source: { not: 'liandid' } }, take: 5, select: { title: true, image: true, sourceName: true, status: true } });
  console.log('RSS news count:', await p.externalNews.count({ where: { source: { not: 'liandid' } } }));
  console.log('APPROVED RSS:', await p.externalNews.count({ where: { source: { not: 'liandid' }, status: 'APPROVED' } }));
  console.log('PENDING RSS:', await p.externalNews.count({ where: { source: { not: 'liandid' }, status: 'PENDING' } }));
  console.log('\nSample RSS news:');
  rss.forEach(n => console.log(`  [${n.status}] ${n.sourceName}: ${n.title.substring(0,40)}\n    img: ${(n.image||'NONE').substring(0,100)}`));
  await p.$disconnect();
}
main();
