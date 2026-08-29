const Database = require('better-sqlite3');
const { Client } = require('pg');

const sqlite = new Database('./prisma/dev.db');
const pg = new Client({
  connectionString: 'postgresql://neondb_owner:npg_4ByTw7qvnGbJ@ep-rough-rice-ax38fn7n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

function s(v) { return v == null ? null : String(v); }
function n(v) { return v == null ? null : Number(v); }
function b(v) { return !!v; }
function d(v) {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v).toISOString();
  if (typeof v === 'string' && /^\d{10,13}$/.test(v)) return new Date(parseInt(v)).toISOString();
  return v;
}

async function migrate() {
  await pg.connect();
  console.log('Connected\n');

  // Debug: check first user
  const u = sqlite.prepare('SELECT * FROM User LIMIT 1').get();
  console.log('First user columns:', Object.keys(u).join(', '));
  console.log('First user data:', JSON.stringify(u, null, 2).substring(0, 500));

  // Debug: check first article
  const a = sqlite.prepare('SELECT * FROM Article LIMIT 1').get();
  console.log('\nFirst article columns:', Object.keys(a).join(', '));
  console.log('First article data:', JSON.stringify(a, null, 2).substring(0, 500));

  // Try insert first user
  try {
    await pg.query(`INSERT INTO "User" (id, email, name, password, role, permissions, avatar, bio, phone, "isActive", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (email) DO NOTHING`,
      [s(u.id), s(u.email), s(u.name), s(u.password), s(u.role), s(u.permissions), s(u.avatar), s(u.bio), s(u.phone), b(u.isActive), s(u.resetToken), d(u.resetTokenExpiry), d(u.createdAt), d(u.updatedAt)]);
    console.log('\nUser insert OK');
  } catch(e) {
    console.log('\nUser insert ERROR:', e.message);
  }

  // Try insert first article
  try {
    await pg.query(`INSERT INTO "Article" (id, title, slug, subtitle, content, excerpt, "featuredImage", status, "viewCount", "isFeatured", "isBreaking", "isPinned", source, "sourceUrl", "publishedAt", "scheduledAt", "createdAt", "updatedAt", "authorId", "categoryId", "metaTitle", "metaDesc", "metaKeywords", region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) ON CONFLICT (id) DO NOTHING`,
      [s(a.id), s(a.title), s(a.slug), s(a.subtitle), s(a.content), s(a.excerpt), s(a.featuredImage), s(a.status), n(a.viewCount), b(a.isFeatured), b(a.isBreaking), b(a.isPinned), s(a.source), s(a.sourceUrl), d(a.publishedAt), d(a.scheduledAt), d(a.createdAt), d(a.updatedAt), s(a.authorId), s(a.categoryId), s(a.metaTitle), s(a.metaDesc), s(a.metaKeywords), s(a.region)]);
    console.log('Article insert OK');
  } catch(e) {
    console.log('Article insert ERROR:', e.message);
  }

  await pg.end();
  sqlite.close();
}

migrate().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
