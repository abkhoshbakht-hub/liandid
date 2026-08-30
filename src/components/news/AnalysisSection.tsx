import Link from 'next/link';

interface AnalysisItem {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image: string | null;
  sourceName: string;
  category: string | null;
  publishedAt: string | null;
  isCustom: boolean;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  if (min < 1) return 'همین الان';
  if (min < 60) return `${min} دقیقه پیش`;
  if (hr < 24) return `${hr} ساعت پیش`;
  return new Date(dateStr).toLocaleDateString('fa-IR');
}

const gradients = [
  'from-[#1B365D] via-[#1f3d6b] to-[#C9A96E]/30',
  'from-[#1B365D] via-[#2a4a7a] to-[#1B365D]/80',
  'from-[#C9A96E]/20 via-[#1B365D] to-[#0f1d35]',
];

export default function AnalysisSection({ items }: { items: AnalysisItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-[#C9A96E] to-[#1B365D] rounded-full" />
          <h2 className="text-xl md:text-2xl font-black text-[#1B365D]">تحلیل خبر</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C9A96E]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#1B365D]/8"
          >
            <div className={`relative h-48 bg-gradient-to-br ${gradients[i % gradients.length]} overflow-hidden`}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/10 text-6xl font-black">ت</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
              {item.category && (
                <span className="absolute top-4 right-4 z-20 text-[10px] px-3 py-1.5 rounded-full font-bold bg-[#C9A96E] text-[#1B365D] shadow-lg shadow-[#C9A96E]/20">
                  {item.category}
                </span>
              )}
              <div className="absolute bottom-0 right-0 left-0 p-4 z-20">
                <span className="text-[10px] text-white/50">{item.sourceName}</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-base font-black text-[#1B365D] group-hover:text-[#C9A96E] transition-colors duration-300 line-clamp-2 leading-relaxed mb-3">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-gray-400 text-xs line-clamp-2 text-justify leading-relaxed mb-4">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-[#1B365D]">{item.sourceName}</span>
                <span className="text-[10px] text-gray-400">{timeAgo(item.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
