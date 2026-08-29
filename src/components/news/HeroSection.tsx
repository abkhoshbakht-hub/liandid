import { timeAgo, getCategoryStyle } from '@/lib/utils';

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

export default function HeroSection({ main, side1, side2 }: { main: NewsItem | null; side1: NewsItem | null; side2: NewsItem | null }) {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Hero */}
        <div className="lg:col-span-8">
          {main ? (
            <a href={main.link} target="_blank" rel="noopener noreferrer" className="group block relative rounded-2xl overflow-hidden h-[280px] sm:h-[360px] lg:h-[420px] bg-[#0a1628]">
              {main.image ? (
                <img src={main.image} alt={main.title} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryStyle(main.category).gradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0a1628]/50 to-transparent" />
              <div className="absolute top-5 right-5 z-20">
                <img src="/logo.png" alt="لیان دید" className="h-12 sm:h-14 drop-shadow-lg" />
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-8 z-20">
                <div className="max-w-3xl">
                  <h1 className="text-2xl md:text-3xl lg:text-[2.5rem] font-black text-white mb-4 leading-[1.6] group-hover:text-[#C9A96E] transition-colors duration-500 drop-shadow-lg">
                    {main.title}
                  </h1>
                  {main.description && (
                    <p className="text-white/70 text-sm md:text-base line-clamp-2 mb-5 leading-relaxed drop-shadow">
                      {main.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {timeAgo(main.publishedAt)}
                    </span>
                    <span className="w-1 h-1 bg-[#C9A96E] rounded-full" />
                    <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">{main.sourceName}</span>
                  </div>
                </div>
              </div>
            </a>
          ) : (
            <div className="rounded-2xl h-[280px] sm:h-[360px] lg:h-[420px] bg-gradient-to-br from-[#0a1628] to-[#1B365D] animate-pulse" />
          )}
        </div>

        {/* Side News */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {[side1, side2].map((news, idx) => (
            news ? (
              <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group flex-1 block relative rounded-2xl overflow-hidden bg-[#0a1628] min-h-[200px]">
                {news.image ? (
                  <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryStyle(news.category).gradient}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/30 to-transparent" />
                <div className="absolute top-4 right-4 z-20">
                  <span className={`inline-block text-[11px] px-3 py-1.5 rounded-full font-bold text-white ${getCategoryStyle(news.category).bg} shadow-lg`}>
                    {news.category}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-5 z-20">
                  <h3 className="text-base font-black text-white group-hover:text-[#C9A96E] transition-colors duration-300 line-clamp-2 leading-[1.8] drop-shadow-lg">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                    <span>{news.sourceName}</span>
                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                    <span>{timeAgo(news.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ) : (
              <div key={idx} className="flex-1 rounded-2xl bg-gray-200 animate-pulse min-h-[200px]" />
            )
          ))}
        </div>
      </div>
    </section>
  );
}
