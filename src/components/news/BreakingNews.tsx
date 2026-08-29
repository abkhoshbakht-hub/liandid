'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image: string | null;
  source: string;
  sourceName: string;
  category: string | null;
  publishedAt: string | null;
  isCustom: boolean;
}

export default function BreakingNews({ items }: { items: NewsItem[] }) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative bg-[#0a1628] rounded-xl py-3 px-5 mb-8 overflow-hidden">
      <div className="flex items-center gap-5">
        <span className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 text-white text-xs px-4 py-1.5 rounded-md font-black uppercase tracking-wider shadow-lg shadow-red-600/30">
          <span className={`w-2 h-2 rounded-full bg-white ${pulse ? 'animate-pulse' : 'opacity-50'}`} />
          فوری
        </span>
        <div className="overflow-hidden relative flex-1">
          <div className="flex gap-20 animate-marquee whitespace-nowrap">
            {[...items, ...items].map((news, index) => (
              <a
                key={`${news.id}-${index}`}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors font-bold text-sm flex items-center gap-3"
              >
                <span className="text-[#C9A96E]">◆</span>
                {news.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
