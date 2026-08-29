const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
const cats = db.prepare('SELECT id,name,slug FROM Category').all();
console.log('SQLite categories:');
cats.forEach(c => console.log(`  ${c.id} | ${c.name} | ${c.slug}`));
const articles = db.prepare('SELECT DISTINCT categoryId FROM Article WHERE categoryId IS NOT NULL').all();
console.log('\nArticle categoryIds:');
articles.forEach(a => console.log(`  ${a.categoryId}`));
db.close();
