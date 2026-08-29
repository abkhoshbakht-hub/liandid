const { Client } = require('pg');
const pg = new Client({
  connectionString: 'postgresql://neondb_owner:npg_4ByTw7qvnGbJ@ep-rough-rice-ax38fn7n-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});
async function main() {
  await pg.connect();
  const tables = await pg.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  console.log('PG Tables:', tables.rows.map(r=>r.tablename).join(', '));
  const articleCols = await pg.query("SELECT column_name FROM information_schema.columns WHERE table_name='Article' ORDER BY ordinal_position");
  console.log('Article columns:', articleCols.rows.map(r=>r.column_name).join(', '));
  await pg.end();
}
main().catch(e=>{console.error(e.message);process.exit(1)});
