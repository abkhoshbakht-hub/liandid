import { prisma } from '@/lib/prisma';
import { NEWSPAPER_SEEDS, KAYHAN_SOURCE, TELEGRAM_SOURCES } from './seed';

// خودترمیم: روزنامه‌ها و سورس‌های پیش‌فرض گمشده را می‌سازد (idempotent).
// در ابتدای هر دریافت (دستی و کرون) صدا زده می‌شود تا هیچ‌وقت «بدون سورس» نمانیم.
export async function ensureDefaultSources(): Promise<{ papers: number; sources: number }> {
  // ترمیم ستون‌های جاافتاده (مثل lastError) در دیتابیس‌های قدیمی
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "lastError" TEXT`);
  } catch {}
  let papers = 0;
  let sources = 0;
  const existing = await prisma.newspaper.findMany({
    include: { sources: { where: { active: true }, select: { type: true } } },
  });
  const bySlug: Record<string, { id: string; types: string[] }> = {};
  for (const p of existing) bySlug[p.slug] = { id: p.id, types: p.sources.map((s) => s.type) };

  for (const s of NEWSPAPER_SEEDS) {
    let id = bySlug[s.slug]?.id;
    if (!id) {
      const created = await prisma.newspaper.create({
        data: { name: s.name, slug: s.slug, category: s.category, displayOrder: s.displayOrder, website: (s as any).website || null, active: true },
      });
      id = created.id;
      papers++;
    }
    bySlug[s.slug] = bySlug[s.slug] || { id, types: [] };
  }

  // سورس رسمی کیهان
  const kayhanId = bySlug[KAYHAN_SOURCE.slug]?.id;
  if (kayhanId && !bySlug[KAYHAN_SOURCE.slug].types.includes('official')) {
    await prisma.newspaperSource.create({
      data: { newspaperId: kayhanId, name: KAYHAN_SOURCE.name, type: KAYHAN_SOURCE.type, url: KAYHAN_SOURCE.url, priority: KAYHAN_SOURCE.priority, active: true, configuration: KAYHAN_SOURCE.configuration },
    });
    sources++;
  }

  // کانال‌های تلگرام اعلام‌شده توسط مدیر
  for (const t of TELEGRAM_SOURCES) {
    const pid = bySlug[t.slug]?.id;
    if (pid && !bySlug[t.slug].types.includes('telegram')) {
      await prisma.newspaperSource.create({
        data: {
          newspaperId: pid, name: t.name, type: 'telegram',
          url: `https://t.me/${t.channel}`, priority: 0, active: true,
          configuration: JSON.stringify({ telegram_channel: t.channel }),
        },
      });
      sources++;
    }
  }
  return { papers, sources };
}
