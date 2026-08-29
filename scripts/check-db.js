const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const news = await prisma.externalNews.findMany({ take: 3, select: { title: true, image: true } });
  news.forEach(n => console.log(`Title: ${n.title.substring(0, 40)}\nImage: ${n.image}\n`));
  
  const slots = await prisma.homepageSlot.findMany({ 
    where: { isActive: true, slotKey: { in: ['latest-1', 'latest-2'] } },
    include: { externalNews: { select: { title: true, image: true } } }
  });
  slots.forEach(s => console.log(`Slot: ${s.slotKey}\nImage: ${s.externalNews?.image}\n`));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
