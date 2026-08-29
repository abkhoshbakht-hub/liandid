const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const all = await p.externalNews.findMany({
    where: { status: 'APPROVED' },
    select: { title: true, image: true, sourceName: true, category: true }
  });

  const keywords = /بوشهر|پارس جنوبی|عسلویه|کنگان|گناوه|دیر|جم|تنگستان|دیلم|خارگ|برازجان|دشتی|دشتستان|انارستان|ریز|شنبه|چاه‌مبارک|حومه/i;
  const bushehr = all.filter(n => keywords.test(n.title));
  
  console.log('Total news:', all.length);
  console.log('Bushehr mentions:', bushehr.length);
  bushehr.forEach(n => console.log(`  [${n.sourceName}] ${n.title.substring(0,60)} img:${n.image ? 'YES' : 'NO'}`));
}

main().catch(e => { console.error(e); process.exit(1); });
