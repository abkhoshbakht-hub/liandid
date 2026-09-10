import type { Metadata } from 'next';
import PaperLoader from './loader';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `صفحه اول روزنامه امروز | لیان دید`,
    description: `مشاهده صفحه اول روزنامه امروز به همراه آرشیو شماره‌های گذشته.`,
    alternates: { canonical: `https://liandid.ir/newspapers/${slug}` },
  };
}

export default async function PaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PaperLoader slug={slug} />;
}
