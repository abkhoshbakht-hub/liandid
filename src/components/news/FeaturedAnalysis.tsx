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

export default function FeaturedAnalysis({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1.5 h-10 bg-gradient-to-b from-[#1B365D] to-[#C9A96E] rounded-full" />
        <h2 className="text-2xl font-black text-[#0a1628]">تحلیل‌ها</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((news) => (
          <a
            key={news.id}
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:shadow-black/8"
          >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-gray-100">
              {news.image ? (
                <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(news.category).gradient}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4">
                <span className={`inline-block text-[11px] px-3 py-1.5 rounded-md font-bold text-white ${getCategoryStyle(news.category).bg} shadow-lg backdrop-blur-sm`}>
                  {news.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-base font-extrabold text-[#0a1628] group-hover:text-[#C9A96E] transition-colors duration-300 mb-3 line-clamp-2 leading-[1.9]">
                {news.title}
              </h3>
              {news.description && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                  {news.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500">{news.sourceName}</span>
                <span className="text-[11px] text-gray-400">{timeAgo(news.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
