const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t=>t.name).join(', '));
const atCols = db.prepare("PRAGMA table_info(_ArticleToTag)").all();
console.log('_ArticleToTag columns:', atCols.map(c=>c.name).join(', '));
const articleCount = db.prepare("SELECT count(*) as c FROM Article").all();
console.log('Articles:', articleCount[0].c);
db.close();
