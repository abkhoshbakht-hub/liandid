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

  const ext = sqlite.prepare('SELECT * FROM ExternalNews').all();
  let eok = 0;
  const batchSize = 50;
  for (let i = 0; i < ext.length; i += batchSize) {
    const batch = ext.slice(i, i + batchSize);
    const vals = [];
    const params = [];
    let pi = 1;
    for (const e of batch) {
      vals.push(`($${pi},$${pi+1},$${pi+2},$${pi+3},$${pi+4},$${pi+5},$${pi+6},$${pi+7},$${pi+8},$${pi+9},$${pi+10},$${pi+11},$${pi+12},$${pi+13})`);
      params.push(s(e.id), s(e.title), s(e.link), s(e.description), s(e.image), s(e.source), s(e.sourceName), s(e.category), s(e.status), b(e.isBreaking), s(e.region), s(e.topic), d(e.publishedAt), d(e.fetchedAt));
      pi += 14;
    }
    try {
      await pg.query(`INSERT INTO "ExternalNews" (id, title, link, description, image, source, "sourceName", category, status, "isBreaking", region, topic, "publishedAt", "fetchedAt") VALUES ${vals.join(',')} ON CONFLICT DO NOTHING`, params);
      eok += batch.length;
    } catch(e) {}
  }
  console.log(`ExternalNews: ${eok}/${ext.length}`);

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
