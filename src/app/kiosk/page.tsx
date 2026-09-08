import { prisma } from '@/lib/prisma';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FrontpageGallery from '@/components/news/FrontpageGallery';
import { toPersianDate } from '@/lib/date';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'صفحه اول روزنامه‌های کشور',
  description: 'تصویر صفحه اول روزنامه‌های کشور به‌صورت روزانه در لیان دید',
  alternates: { canonical: 'https://liandid.ir/kiosk' },
};

export const dynamic = 'force-dynamic';

async function getFrontpages() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'frontpage:' } },
    orderBy: { key: 'desc' },
    take: 200,
  });
  const byDate = new Map<string, { paper: string; image: string }[]>();
  for (const r of rows) {
    const parts = r.key.split(':');
    if (parts.length < 3) continue;
    const date = parts[1];
    try {
      const data = JSON.parse(r.value);
      if (!data?.image || !data?.paper) continue;
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push({ paper: data.paper, image: data.image });
    } catch {}
  }
  const dates = [...byDate.keys()].sort().reverse();
  const latest = dates[0] || null;
  return { latest, items: latest ? byDate.get(latest)! : [] };
}

export default async function KioskPage() {
  const { latest, items } = await getFrontpages();

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[#1B365D]">صفحه اول روزنامه‌های کشور</h1>
            {latest && (
              <p className="text-gray-500 mt-2">{toPersianDate(new Date(latest + 'T00:00:00'))}</p>
            )}
          </div>
          <FrontpageGallery items={items} />
        </div>
      </main>
      <Footer />
    </>
  );
}
