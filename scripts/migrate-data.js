const { Client } = require('pg');
const Database = require('better-sqlite3');

const pg = new Client({
  connectionString: 'postgresql://neondb_owner:npg_4ByTw7qvnGbJ@ep-rough-rice-ax38fn7n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});
const sqlite = new Database('./prisma/dev.db');

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
  console.log('Connected. Cleaning PostgreSQL...');
  
  await pg.query('DELETE FROM "_ArticleToTag"');
  await pg.query('DELETE FROM "Comment"');
  await pg.query('DELETE FROM "HomepageSlot"');
  await pg.query('DELETE FROM "ExternalNews"');
  await pg.query('DELETE FROM "Article"');
  await pg.query('DELETE FROM "Tag"');
  await pg.query('DELETE FROM "Category"');
  await pg.query('DELETE FROM "User"');
  await pg.query('DELETE FROM "Subscriber"');
  await pg.query('DELETE FROM "UserSubmission"');
  await pg.query('DELETE FROM "StaticPage"');
  await pg.query('DELETE FROM "SiteSetting"');
  console.log('Cleaned.\n');

  const users = sqlite.prepare('SELECT * FROM User').all();
  for (const u of users) {
    try {
      await pg.query(`INSERT INTO "User" (id, email, name, password, role, permissions, avatar, bio, phone, "isActive", "resetToken", "resetTokenExpiry", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
        [s(u.id), s(u.email), s(u.name), s(u.password), s(u.role), s(u.permissions), s(u.avatar), s(u.bio), s(u.phone), b(u.isActive), s(u.resetToken), d(u.resetTokenExpiry), d(u.createdAt), d(u.updatedAt)]);
    } catch(e) { console.log('User err:', e.message.substring(0,80)); }
  }
  console.log(`Users: ${users.length}`);

  const cats = sqlite.prepare('SELECT * FROM Category').all();
  for (const c of cats) {
    try {
      await pg.query(`INSERT INTO "Category" (id, name, slug, icon, color, "order") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [s(c.id), s(c.name), s(c.slug), s(c.icon), s(c.color), n(c.order)]);
    } catch(e) { console.log('Cat err:', e.message.substring(0,80)); }
  }
  console.log(`Categories: ${cats.length}`);

  const tags = sqlite.prepare('SELECT * FROM Tag').all();
  for (const t of tags) {
    try {
      await pg.query(`INSERT INTO "Tag" (id, name, slug) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [s(t.id), s(t.name), s(t.slug)]);
    } catch(e) {}
  }
  console.log(`Tags: ${tags.length}`);

  const articles = sqlite.prepare('SELECT * FROM Article').all();
  let aok = 0, afail = 0;
  for (const a of articles) {
    try {
      await pg.query(`INSERT INTO "Article" (id, title, slug, subtitle, content, excerpt, "featuredImage", status, "viewCount", "isFeatured", "isBreaking", "isPinned", source, "sourceUrl", "publishedAt", "scheduledAt", "createdAt", "updatedAt", "authorId", "categoryId", "metaTitle", "metaDesc", "metaKeywords", region) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) ON CONFLICT DO NOTHING`,
        [s(a.id), s(a.title), s(a.slug), s(a.subtitle), s(a.content), s(a.excerpt), s(a.featuredImage), s(a.status), n(a.viewCount), b(a.isFeatured), b(a.isBreaking), b(a.isPinned), s(a.source), s(a.sourceUrl), d(a.publishedAt), d(a.scheduledAt), d(a.createdAt), d(a.updatedAt), s(a.authorId), s(a.categoryId), s(a.metaTitle), s(a.metaDesc), s(a.metaKeywords), s(a.region)]);
      aok++;
    } catch(e) { afail++; console.log('Article err:', a.slug, e.message.substring(0,80)); }
  }
  console.log(`Articles: ${aok} ok, ${afail} fail`);

  const a2t = sqlite.prepare('SELECT * FROM _ArticleToTag').all();
  let a2tok = 0;
  for (const r of a2t) {
    try {
      await pg.query('INSERT INTO "_ArticleToTag" ("A","B") VALUES ($1,$2) ON CONFLICT DO NOTHING', [s(r.A), s(r.B)]);
      a2tok++;
    } catch(e) {}
  }
  console.log(`ArticleTags: ${a2tok}`);

  const comments = sqlite.prepare('SELECT * FROM Comment').all();
  let cok = 0;
  for (const c of comments) {
    try {
      await pg.query(`INSERT INTO "Comment" (id, content, approved, "createdAt", "userId", "articleId") VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [s(c.id), s(c.content), b(c.approved), d(c.createdAt), s(c.userId), s(c.articleId)]);
      cok++;
    } catch(e) {}
  }
  console.log(`Comments: ${cok}`);

  const ext = sqlite.prepare('SELECT * FROM ExternalNews').all();
  for (const e of ext) {
    try {
      await pg.query(`INSERT INTO "ExternalNews" (id, title, link, description, image, source, "sourceName", category, status, "isBreaking", region, topic, "publishedAt", "fetchedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
        [s(e.id), s(e.title), s(e.link), s(e.description), s(e.image), s(e.source), s(e.sourceName), s(e.category), s(e.status), b(e.isBreaking), s(e.region), s(e.topic), d(e.publishedAt), d(e.fetchedAt)]);
    } catch(e) {}
  }
  console.log(`ExternalNews: ${ext.length}`);

  const slots = sqlite.prepare('SELECT * FROM HomepageSlot').all();
  for (const sl of slots) {
    try {
      await pg.query(`INSERT INTO "HomepageSlot" (id, "slotKey", label, type, "externalNewsId", "customTitle", "customContent", "customImage", "customLink", category, "isActive", "order", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
        [s(sl.id), s(sl.slotKey), s(sl.label), s(sl.type), s(sl.externalNewsId), s(sl.customTitle), s(sl.customContent), s(sl.customImage), s(sl.customLink), s(sl.category), b(sl.isActive), n(sl.order), d(sl.createdAt), d(sl.updatedAt)]);
    } catch(e) {}
  }
  console.log(`HomepageSlots: ${slots.length}`);

  const pages = sqlite.prepare('SELECT * FROM StaticPage').all();
  for (const p of pages) {
    try {
      await pg.query(`INSERT INTO "StaticPage" (id, slug, title, content, excerpt, "featuredImage", "authorName", "authorImage", "updatedAt", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
        [s(p.id), s(p.slug), s(p.title), s(p.content), s(p.excerpt), s(p.featuredImage), s(p.authorName), s(p.authorImage), d(p.updatedAt), d(p.createdAt)]);
    } catch(e) {}
  }
  console.log(`StaticPages: ${pages.length}`);

  const subs = sqlite.prepare('SELECT * FROM Subscriber').all();
  for (const sub of subs) {
    try {
      await pg.query(`INSERT INTO "Subscriber" (id, email, name, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [s(sub.id), s(sub.email), s(sub.name), b(sub.isActive), d(sub.createdAt)]);
    } catch(e) {}
  }
  console.log(`Subscribers: ${subs.length}`);

  const subs2 = sqlite.prepare('SELECT * FROM UserSubmission').all();
  for (const s2 of subs2) {
    try {
      await pg.query(`INSERT INTO "UserSubmission" (id, title, content, category, "mediaType", "mediaUrl", "fileName", "senderName", "senderPhone", "senderEmail", status, "adminNote", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
        [s(s2.id), s(s2.title), s(s2.content), s(s2.category), s(s2.mediaType), s(s2.mediaUrl), s(s2.fileName), s(s2.senderName), s(s2.senderPhone), s(s2.senderEmail), s(s2.status), s(s2.adminNote), d(s2.createdAt), d(s2.updatedAt)]);
    } catch(e) {}
  }
  console.log(`UserSubmissions: ${subs2.length}`);

  const settings = sqlite.prepare('SELECT * FROM SiteSetting').all();
  for (const st of settings) {
    try {
      await pg.query(`INSERT INTO "SiteSetting" (key, value, "updatedAt") VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, "updatedAt"=EXCLUDED."updatedAt"`,
        [s(st.key), s(st.value), d(st.updatedAt)]);
    } catch(e) {}
  }
  console.log(`SiteSettings: ${settings.length}`);

  console.log('\nMIGRATION COMPLETE');
  await pg.end();
  sqlite.close();
}

migrate().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
