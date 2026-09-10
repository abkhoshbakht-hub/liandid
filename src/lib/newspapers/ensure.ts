import { prisma } from '@/lib/prisma';
import { NEWSPAPER_SEEDS, OFFICIAL_SOURCES, EXTRA_SOURCES, TELEGRAM_SOURCES } from './seed';

// خودترمیم: روزنامه‌ها و سورس‌های پیش‌فرض گمشده را می‌سازد (idempotent).
// در ابتدای هر دریافت (دستی و کرون) صدا زده می‌شود تا هیچ‌وقت «بدون سورس» نمانیم.
export async function ensureDefaultSources(): Promise<{ papers: number; sources: number }> {
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
  let papers = 0;
  let sources = 0;
  const existing = await prisma.newspaper.findMany({
    include: { sources: { where: { active: true }, select: { type: true, url: true, configuration: true } } },
  });
  const bySlug: Record<string, { id: string; types: string[]; urls: string[] }> = {};
  for (const p of existing) bySlug[p.slug] = { id: p.id, types: p.sources.map((s) => s.type), urls: p.sources.map((s) => s.url || '') };

  for (const s of NEWSPAPER_SEEDS) {
    let id = bySlug[s.slug]?.id;
    if (!id) {
      const created = await prisma.newspaper.create({
        data: { name: s.name, slug: s.slug, category: s.category, displayOrder: s.displayOrder, website: (s as any).website || null, active: true },
      });
      id = created.id;
      papers++;
    }
    bySlug[s.slug] = bySlug[s.slug] || { id, types: [], urls: [] };
  }

  // سورس‌های رسمی تأییدشده (کیهان، شرق، ایران، ...)
  for (const o of OFFICIAL_SOURCES) {
    const oid = bySlug[o.slug]?.id;
    if (oid && !bySlug[o.slug].types.includes('official')) {
      await prisma.newspaperSource.create({
        data: { newspaperId: oid, name: o.name, type: o.type, url: o.url, priority: o.priority, active: true, configuration: o.configuration },
      });
      sources++;
    }
  }

  // کانال‌های تلگرام اعلام‌شده توسط مدیر (+ به‌روزرسانی الگوی کانال‌های قدیمی)
  for (const t of TELEGRAM_SOURCES) {
    const pid = bySlug[t.slug]?.id;
    if (!pid) continue;
    const url = `https://t.me/${t.channel}`;
    const cfg = JSON.stringify(t.patterns ? { telegram_channel: t.channel, coverPatterns: t.patterns } : { telegram_channel: t.channel });
    if (!bySlug[t.slug].types.includes('telegram')) {
      await prisma.newspaperSource.create({
        data: { newspaperId: pid, name: t.name, type: 'telegram', url, priority: 0, active: true, configuration: cfg },
      });
      bySlug[t.slug].types.push('telegram');
      bySlug[t.slug].urls.push(url);
      sources++;
    } else if (t.patterns) {
      const cur = existing.find((p) => p.slug === t.slug)?.sources.find((s) => s.type === 'telegram');
      try {
        const curCfg = cur?.configuration ? JSON.parse(cur.configuration) : {};
        if (!curCfg.coverPatterns) {
          await prisma.newspaperSource.updateMany({ where: { newspaperId: pid, type: 'telegram' }, data: { configuration: cfg, name: t.name, url } });
        }
      } catch {}
    }
  }

  // سورس‌های تکمیلی (خراسان، پیشخوان، تسنیم) — dedup با URL
  for (const e of EXTRA_SOURCES) {
    const pid = bySlug[e.slug]?.id;
    if (!pid || bySlug[e.slug].urls.includes(e.url)) continue;
    await prisma.newspaperSource.create({
      data: { newspaperId: pid, name: e.name, type: e.type, url: e.url, priority: e.priority, active: true, configuration: e.configuration },
    });
    bySlug[e.slug].urls.push(e.url);
    sources++;
  }
  return { papers, sources };
}
