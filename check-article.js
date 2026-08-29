const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const a = await p.article.findFirst({ where: { slug: 'liandid-news-agency-inauguration' }, select: { id: true, title: true, status: true, publishedAt: true, slug: true } });
  console.log('Article:', JSON.stringify(a, null, 2));
  p.$disconnect();
}
main();
