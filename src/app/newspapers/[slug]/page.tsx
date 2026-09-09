import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { tehranToday } from '@/lib/newspapers/date';
import PaperPageClient from './client';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let name = 'روزنامه';
  let ogImage: string | undefined;
  try {
    const p = await prisma.newspaper.findFirst({ where: { slug, active: true }, select: { id: true, name: true } });
    if (p) {
      name = p.name;
      const day = tehranToday();
      const t = await prisma.newspaperIssue.findFirst({ where: { newspaperId: p.id, date: day.utcMidnight, status: 'PUBLISHED' }, select: { imageUrl: true } });
      if (t?.imageUrl && !t.imageUrl.startsWith('data:')) ogImage = t.imageUrl;
    }
  } catch {}
  return {
    title: `صفحه اول روزنامه ${name} امروز | آرشیو روزنامه ${name}`,
    description: `مشاهده صفحه اول روزنامه ${name} امروز به همراه آرشیو شماره‌های گذشته.`,
    alternates: { canonical: `https://liandid.ir/newspapers/${slug}` },
    openGraph: { title: `صفحه اول روزنامه ${name}`, description: `جلد امروز و آرشیو روزنامه ${name}`, type: 'article', url: `https://liandid.ir/newspapers/${slug}`, images: ogImage ? [{ url: ogImage }] : undefined },
  };
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let paper: any = null;
  let today: any = null;
  let recent: any[] = [];
  let todayDate = '';
  try {
    paper = await prisma.newspaper.findFirst({ where: { slug, active: true } });
    if (!paper) return notFound();
    const day = tehranToday();
    todayDate = day.persian;
    [today, recent] = await Promise.all([
      prisma.newspaperIssue.findFirst({ where: { newspaperId: paper.id, date: day.utcMidnight, status: 'PUBLISHED' } }),
      prisma.newspaperIssue.findMany({ where: { newspaperId: paper.id, status: 'PUBLISHED' }, orderBy: { date: 'desc' }, take: 24 }),
    ]);
  } catch {
    return notFound();
  }

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `صفحه اول روزنامه ${paper.name}`,
    image: today ? [today.imageUrl] : undefined,
    datePublished: today ? today.date : undefined,
  };

  return (
    <main className="max-w-6xl mx-auto px-3 md:px-6 py-6" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PaperPageClient paper={paper} today={today} recent={recent} todayDate={todayDate} />
    </main>
  );
}
