const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const cat = await p.category.findFirst({ where: { slug: 'custom-news' } });
  if (!cat) {
    await p.category.create({ data: { name: 'اخبار اختصاصی لیان دید', slug: 'custom-news', color: '#7c3aed', order: 99 } });
    console.log('Category created');
  } else {
    console.log('Category exists: ' + cat.id);
  }
  await p.$disconnect();
})();
