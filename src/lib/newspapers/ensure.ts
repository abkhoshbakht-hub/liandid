import { prisma } from '@/lib/prisma';
import { NEWSPAPER_SEEDS, OFFICIAL_SOURCES, EXTRA_SOURCES, TELEGRAM_SOURCES, TASNIM_URL } from './seed';

// خودترمیم: روزنامه‌ها و سورس‌های پیش‌فرض گمشده را می‌سازد و کانفیگ سورس‌های
// خودکارِ موجود را با seed فعلی sync می‌کند (idempotent — بدون رکورد تکراری).
// در ابتدای هر دریافت (دستی و کرون) صدا زده می‌شود تا هیچ‌وقت «بدون سورس» نمانیم.
export async function ensureDefaultSources(): Promise<{ papers: number; sources: number; synced: number }> {
  // ترمیم ستون‌های جاافتاده (مثل lastError) در دیتابیس‌های قدیمی
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "lastError" TEXT`);
  } catch {}
  // خودترمیم فعال‌بودن: ردیف‌های قدیمی که active آنها NULL/false مانده را فعال کن
  try {
    await prisma.newspaper.updateMany({
      where: { slug: { in: NEWSPAPER_SEEDS.map((s) => s.slug) }, NOT: { active: true } },
      data: { active: true },
    });
  } catch {}
  // F3: سورس‌های tasnim با URL مرده همیشه غیرفعال بمانند (ردیف و کانفیگ حفظ می‌شود)
  try {
    await prisma.newspaperSource.updateMany({
      where: { type: 'tasnim', url: TASNIM_URL, active: true },
      data: { active: false },
    });
  } catch {}
  let papers = 0;
  let sources = 0;
  let synced = 0;
  const existing = await prisma.newspaper.findMany({
    include: { sources: true },
  });
  const bySlug: Record<string, { id: string; sources: { id: string; type: string; url: string | null; name: string; priority: number; configuration: string | null }[] }> = {};
  for (const p of existing) {
    bySlug[p.slug] = {
      id: p.id,
      sources: p.sources.map((s) => ({ id: s.id, type: s.type, url: s.url, name: s.name, priority: s.priority, configuration: s.configuration })),
    };
  }

  for (const s of NEWSPAPER_SEEDS) {
    let id = bySlug[s.slug]?.id;
    if (!id) {
      const created = await prisma.newspaper.create({
        data: { name: s.name, slug: s.slug, category: s.category, displayOrder: s.displayOrder, website: (s as any).website || null, active: true },
      });
      id = created.id;
      papers++;
    }
    if (!bySlug[s.slug]) bySlug[s.slug] = { id, sources: [] };
  }

  // upsert سورس خودکار: تطبیق با (paper, type) — به‌روزرسانی کانفیگ قدیمی، بدون تکرار
  async function upsertAuto(paperId: string, seed: { name: string; type: string; url: string; priority: number; configuration: string }, bucket: { id: string; sources: { id: string; type: string; url: string | null; name: string; priority: number; configuration: string | null }[] }) {
    const cur = bucket.sources.find((x) => x.type === seed.type);
    if (!cur) {
      const created = await prisma.newspaperSource.create({
        data: { newspaperId: paperId, name: seed.name, type: seed.type, url: seed.url, priority: seed.priority, active: true, configuration: seed.configuration },
      });
      bucket.sources.push({ id: created.id, type: seed.type, url: seed.url, name: seed.name, priority: seed.priority, configuration: seed.configuration });
      sources++;
      return;
    }
    // resync: هر فیلدی که با seed فرق دارد به نسخه فعلی برسد
    if (cur.name !== seed.name || (cur.url || '') !== seed.url || cur.priority !== seed.priority || (cur.configuration || '') !== seed.configuration) {
      await prisma.newspaperSource.update({
        where: { id: cur.id },
        data: { name: seed.name, url: seed.url, priority: seed.priority, configuration: seed.configuration },
      });
      cur.name = seed.name; cur.url = seed.url; cur.priority = seed.priority; cur.configuration = seed.configuration;
      synced++;
    }
  }

  // سورس‌های رسمی تأییدشده (کیهان، شرق، ایران، ...)
  for (const o of OFFICIAL_SOURCES) {
    const b = bySlug[o.slug];
    if (b) await upsertAuto(b.id, o, b);
  }

  // کانال‌های تلگرام اعلام‌شده توسط مدیر
  for (const t of TELEGRAM_SOURCES) {
    const b = bySlug[t.slug];
    if (!b) continue;
    await upsertAuto(b.id, {
      name: t.name, type: 'telegram', url: `https://t.me/${t.channel}`, priority: 0,
      configuration: JSON.stringify(t.patterns ? { telegram_channel: t.channel, coverPatterns: t.patterns } : { telegram_channel: t.channel }),
    }, b);
  }

  // سورس‌های تکمیلی (پیشخوان و موارد خاص) — تطبیق با URL تا سورس دستی ادمین دست نخورد
  for (const e of EXTRA_SOURCES) {
    const b = bySlug[e.slug];
    if (!b) continue;
    const cur = b.sources.find((x) => (x.url || '') === e.url);
    if (!cur) {
      const created = await prisma.newspaperSource.create({
        data: { newspaperId: b.id, name: e.name, type: e.type, url: e.url, priority: e.priority, active: true, configuration: e.configuration },
      });
      b.sources.push({ id: created.id, type: e.type, url: e.url, name: e.name, priority: e.priority, configuration: e.configuration });
      sources++;
    } else if (cur.name !== e.name || cur.type !== e.type || cur.priority !== e.priority || (cur.configuration || '') !== e.configuration) {
      await prisma.newspaperSource.update({
        where: { id: cur.id },
        data: { name: e.name, type: e.type, priority: e.priority, configuration: e.configuration },
      });
      synced++;
    }
  }
  return { papers, sources, synced };
}
