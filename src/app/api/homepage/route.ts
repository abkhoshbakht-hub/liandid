import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isBushehrNews } from '@/lib/bushehr';

export async function GET() {
  try {
    const slots = await prisma.homepageSlot.findMany({
      where: { isActive: true },
      include: {
        externalNews: {
          select: {
            id: true, title: true, link: true, description: true, image: true,
            source: true, sourceName: true, category: true, publishedAt: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    // آخرین اخبار تایید شده
    const approvedNews = await prisma.externalNews.findMany({
      where: { status: 'APPROVED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, link: true, description: true, image: true,
        source: true, sourceName: true, category: true, publishedAt: true,
      },
    });

    const toItem = (n: typeof approvedNews[0]) => ({
      ...n, isCustom: false,
    });

    const resolve = (s: typeof slots[0] | null | undefined, fallbackIndex: number = -1) => {
      if (!s) {
        // باکس غیرفعال یا خالی: فقط در صورت درخواست صریح، خودکار پر شود
        if (fallbackIndex >= 0 && approvedNews[fallbackIndex]) {
          return toItem(approvedNews[fallbackIndex]);
        }
        return null;
      }
      if (s.type === 'CUSTOM' && s.customTitle) {
        return {
          id: s.id, title: s.customTitle, link: s.customLink || '#',
          description: s.customContent || '', image: s.customImage || '',
          source: 'لیان دید', sourceName: 'لیان دید',
          category: s.category || 'اختصاصی', publishedAt: null,
          isCustom: true,
        };
      }
      if (s.type === 'EXTERNAL' && s.externalNews) {
        return toItem(s.externalNews);
      }
      // خودکار: از آخرین اخبار تایید شده
      if (fallbackIndex >= 0 && approvedNews[fallbackIndex]) {
        return toItem(approvedNews[fallbackIndex]);
      }
      return null;
    };

    const heroMain = resolve(slots.find(s => s.slotKey === 'hero-main')!, 0);
    const heroSide1 = resolve(slots.find(s => s.slotKey === 'hero-side-1')!, 1);
    const heroSide2 = resolve(slots.find(s => s.slotKey === 'hero-side-2')!, 2);

    const breakingKeys = ['breaking-1', 'breaking-2', 'breaking-3', 'breaking-4', 'breaking-5'];
    const breaking = breakingKeys.map((k, i) =>
      resolve(slots.find(s => s.slotKey === k)!, 3 + i)
    ).filter(Boolean);

    // آخرین اخبار: فقط باکس‌های تاییدشده مدیر — بدون پر کردن خودکار، فقط اخبار بوشهر
    const latestKeys = ['latest-1', 'latest-2', 'latest-3', 'latest-4', 'latest-5', 'latest-6', 'latest-7', 'latest-8', 'latest-9', 'latest-10'];
    const latestSeen = new Set<string>();
    const latest = latestKeys
      .map((k) => resolve(slots.find(s => s.slotKey === k) ?? null))
      .filter((n): n is NonNullable<typeof n> => {
        if (!n || latestSeen.has(n.id)) return false;
        // خبر اختصاصی مدیر همیشه مجاز است؛ خبر خبرگزاری فقط اگر بوشهری باشد
        if (!n.isCustom && !isBushehrNews({ category: n.category, sourceName: n.sourceName, title: n.title, description: n.description })) return false;
        latestSeen.add(n.id);
        return true;
      });

    const analysisKeys = ['analysis-1', 'analysis-2', 'analysis-3'];
    const analysis = analysisKeys.map((k, i) =>
      resolve(slots.find(s => s.slotKey === k)!, 18 + i)
    ).filter(Boolean);

    // دسته‌بندی‌ها بر اساس اخبار تایید شده
    const categoryMap: Record<string, typeof approvedNews> = {};
    for (const news of approvedNews) {
      const cat = news.category || 'سایر';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      if (categoryMap[cat].length < 5) categoryMap[cat].push(news);
    }

    return NextResponse.json({
      success: true,
      data: { heroMain, heroSide1, heroSide2, breaking, latest, analysis, categoryNews: categoryMap },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
