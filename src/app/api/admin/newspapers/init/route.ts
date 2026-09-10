import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NEWSPAPER_SEEDS, OFFICIAL_SOURCES, EXTRA_SOURCES, TELEGRAM_SOURCES } from '@/lib/newspapers/seed';

// وضعیت راه‌اندازی ماژول روزنامه‌ها
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }
    const papers = await prisma.newspaper.count();
    return NextResponse.json({ success: true, data: { initialized: true, papers } });
  } catch {
    return NextResponse.json({ success: true, data: { initialized: false, papers: 0 } });
  }
}

// راه‌اندازی یک‌باره: ساخت جداول + سید ۱۴ روزنامه
// (دیتابیس از بیرون در دسترس نیست؛ این مسیر با دسترسی ادمین جداول را می‌سازد)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'غیرمجاز' }, { status: 403 });
    }

    const ddl = [
      `CREATE TABLE IF NOT EXISTS "Newspaper" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "category" TEXT NOT NULL, "logo" TEXT, "website" TEXT, "telegram" TEXT, "description" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "displayOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Newspaper_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Newspaper_slug_key" ON "Newspaper"("slug")`,
      `CREATE TABLE IF NOT EXISTS "NewspaperSource" ("id" TEXT NOT NULL, "newspaperId" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "url" TEXT, "priority" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true, "parserType" TEXT, "configuration" TEXT, "lastSuccessAt" TIMESTAMP(3), "lastFailureAt" TIMESTAMP(3), "lastError" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "NewspaperSource_pkey" PRIMARY KEY ("id"))`,
      `CREATE INDEX IF NOT EXISTS "NewspaperSource_newspaperId_idx" ON "NewspaperSource"("newspaperId")`,
      `CREATE TABLE IF NOT EXISTS "NewspaperIssue" ("id" TEXT NOT NULL, "newspaperId" TEXT NOT NULL, "date" TIMESTAMP(3) NOT NULL, "persianDate" TEXT NOT NULL, "issueNumber" TEXT, "title" TEXT, "originalUrl" TEXT, "imageUrl" TEXT, "thumbnailUrl" TEXT, "sourceId" TEXT, "imageHash" TEXT, "confidence" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'PENDING', "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "NewspaperIssue_pkey" PRIMARY KEY ("id"))`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "NewspaperIssue_newspaperId_date_key" ON "NewspaperIssue"("newspaperId", "date")`,
      `CREATE INDEX IF NOT EXISTS "NewspaperIssue_date_idx" ON "NewspaperIssue"("date")`,
      `CREATE INDEX IF NOT EXISTS "NewspaperIssue_status_idx" ON "NewspaperIssue"("status")`,
      `CREATE TABLE IF NOT EXISTS "NewspaperFetchLog" ("id" TEXT NOT NULL, "newspaperId" TEXT, "sourceId" TEXT, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "finishedAt" TIMESTAMP(3), "status" TEXT NOT NULL, "httpStatus" INTEGER, "errorMessage" TEXT, "discoveredImageUrl" TEXT, "discoveredDate" TEXT, "responseTimeMs" INTEGER, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "NewspaperFetchLog_pkey" PRIMARY KEY ("id"))`,
      `CREATE INDEX IF NOT EXISTS "NewspaperFetchLog_newspaperId_idx" ON "NewspaperFetchLog"("newspaperId")`,
      `CREATE INDEX IF NOT EXISTS "NewspaperFetchLog_createdAt_idx" ON "NewspaperFetchLog"("createdAt")`,
    ];
    for (const sql of ddl) {
      await prisma.$executeRawUnsafe(sql);
    }
    // خودترمیم ستون‌های جاافتاده در نصب‌های قبلی
    const heal = [
      `ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "lastError" TEXT`,
      `ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "lastSuccessAt" TIMESTAMP(3)`,
      `ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "lastFailureAt" TIMESTAMP(3)`,
      `ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "parserType" TEXT`,
      `ALTER TABLE "NewspaperSource" ADD COLUMN IF NOT EXISTS "configuration" TEXT`,
    ];
    for (const sql of heal) {
      try { await prisma.$executeRawUnsafe(sql); } catch {}
    }
    // کلیدهای خارجی (اگر جدول‌ها تازه ساخته شده باشند)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperSource" DROP CONSTRAINT IF EXISTS "NewspaperSource_newspaperId_fkey"`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperSource" ADD CONSTRAINT "NewspaperSource_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperIssue" DROP CONSTRAINT IF EXISTS "NewspaperIssue_newspaperId_fkey"`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "NewspaperIssue" ADD CONSTRAINT "NewspaperIssue_newspaperId_fkey" FOREIGN KEY ("newspaperId") REFERENCES "Newspaper"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    } catch {}

    let seeded = 0;
    for (const s of NEWSPAPER_SEEDS) {
      const existing = await prisma.newspaper.findUnique({ where: { slug: s.slug } });
      if (!existing) {
        await prisma.newspaper.create({
          data: { name: s.name, slug: s.slug, category: s.category, displayOrder: s.displayOrder, website: (s as any).website || null, active: true },
        });
        seeded++;
      } else if ((s as any).website && !existing.website) {
        await prisma.newspaper.update({ where: { slug: s.slug }, data: { website: (s as any).website } });
      }
    }
    // خودترمیم فعال‌بودن ردیف‌های قدیمی (active ‏NULL‏/false)
    try {
      await prisma.newspaper.updateMany({
        where: { slug: { in: NEWSPAPER_SEEDS.map((s) => s.slug) }, NOT: { active: true } },
        data: { active: true },
      });
    } catch {}
    // سورس‌های رسمی تأییدشده (فقط یک بار برای هر روزنامه)
    let kayhanSource = false;
    for (const o of OFFICIAL_SOURCES) {
      const paper = await prisma.newspaper.findUnique({ where: { slug: o.slug } });
      if (!paper) continue;
      const ex = await prisma.newspaperSource.findFirst({ where: { newspaperId: paper.id, type: 'official' } });
      if (!ex) {
        await prisma.newspaperSource.create({
          data: { newspaperId: paper.id, name: o.name, type: o.type, url: o.url, priority: o.priority, active: true, configuration: o.configuration },
        });
        if (o.slug === 'kayhan') kayhanSource = true;
      }
    }

    // سورس‌های تلگرام اعلام‌شده توسط مدیر (فقط یک بار برای هر روزنامه + به‌روزرسانی الگو)
    let telegramSeeded = 0;
    for (const t of TELEGRAM_SOURCES) {
      const paper = await prisma.newspaper.findUnique({ where: { slug: t.slug } });
      if (!paper) continue;
      const url = `https://t.me/${t.channel}`;
      const cfg = JSON.stringify(t.patterns ? { telegram_channel: t.channel, coverPatterns: t.patterns } : { telegram_channel: t.channel });
      const ex = await prisma.newspaperSource.findFirst({ where: { newspaperId: paper.id, type: 'telegram' } });
      if (!ex) {
        await prisma.newspaperSource.create({
          data: { newspaperId: paper.id, name: t.name, type: 'telegram', url, priority: 0, active: true, configuration: cfg },
        });
        telegramSeeded++;
      } else if (t.patterns) {
        try {
          const curCfg = ex.configuration ? JSON.parse(ex.configuration) : {};
          if (!curCfg.coverPatterns) {
            await prisma.newspaperSource.update({ where: { id: ex.id }, data: { configuration: cfg, name: t.name, url } });
          }
        } catch {}
      }
    }

    // سورس‌های تکمیلی (خراسان، پیشخوان، تسنیم) — dedup با URL
    let extraSeeded = 0;
    for (const e of EXTRA_SOURCES) {
      const paper = await prisma.newspaper.findUnique({ where: { slug: e.slug }, include: { sources: { where: { active: true }, select: { url: true } } } });
      if (!paper || paper.sources.some((s) => (s.url || '') === e.url)) continue;
      await prisma.newspaperSource.create({
        data: { newspaperId: paper.id, name: e.name, type: e.type, url: e.url, priority: e.priority, active: true, configuration: e.configuration },
      });
      extraSeeded++;
    }

    const papers = await prisma.newspaper.count();
    return NextResponse.json({ success: true, data: { tables: true, seeded, papers, kayhanSource, telegramSeeded, extraSeeded } });
  } catch (e: any) {
    console.error('Newspaper init error:', e);
    return NextResponse.json({ success: false, message: 'ERR: ' + String(e?.message || e).slice(0, 400) }, { status: 500 });
  }
}
