'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CommentForm from '@/components/news/CommentForm';
import CommentList from '@/components/news/CommentList';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  viewCount: number;
  publishedAt: string;
  author: { name: string; avatar: string | null };
  category: { name: string; slug: string; color: string };
}

export default function ArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/articles/${slug}`)
      .then(r => r.json())
      .then(data => { if (data.success) setArticle(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-gray-50 min-h-screen">
          <div className="site-container py-8 text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">در حال بارگذاری...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <main className="bg-gray-50 min-h-screen">
          <div className="site-container py-8 text-center py-20">
            <h1 className="text-2xl font-bold text-gray-600">خبر یافت نشد</h1>
            <Link href="/" className="mt-4 inline-block text-[#1B365D] hover:text-[#C9A96E]">بازگشت به صفحه اصلی</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="site-container py-8">
          <article className="max-w-4xl mx-auto">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'NewsArticle',
                  headline: article.title,
                  description: article.excerpt || article.title,
                  image: article.featuredImage || undefined,
                  datePublished: article.publishedAt,
                  author: { '@type': 'Person', name: article.author?.name || 'لیان دید' },
                  publisher: {
                    '@type': 'Organization',
                    name: 'لیان دید',
                    logo: { '@type': 'ImageObject', url: 'https://liandid.ir/logo.png' },
                  },
                  mainEntityOfPage: { '@type': 'WebPage', '@id': `https://liandid.ir/news/${slug}` },
                  articleSection: article.category?.name || undefined,
                  wordCount: article.content?.length || 0,
                }),
              }}
            />
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              {article.featuredImage && (
                <div className="relative h-64 md:h-96">
                  <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-[#1B365D] text-white">{article.category?.name}</span>
                  <span className="text-sm text-gray-500">{formatDate(article.publishedAt)}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{article.viewCount} بازدید</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-[#1B365D] mb-6 leading-relaxed">{article.title}</h1>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2E5090] flex items-center justify-center text-white font-bold">
                    {article.author?.name?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{article.author?.name || 'نویسنده'}</div>
                    <div className="text-xs text-gray-500">خبرنگار لیان دید</div>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-justify">{article.content}</div>
              </div>
            </div>
            <div className="mt-8 space-y-8">
              <CommentList articleId={article.id} />
              <CommentForm articleId={article.id} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
