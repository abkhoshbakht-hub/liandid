'use client';

import { useState } from 'react';

export interface FrontpageItem {
  paper: string;
  image: string;
}

export default function FrontpageGallery({ items }: { items: FrontpageItem[] }) {
  const [selected, setSelected] = useState<FrontpageItem | null>(null);

  if (items.length === 0) {
    return <p className="text-gray-400 text-center py-16">هنوز جلد روزنامه‌ای ثبت نشده است</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map(item => (
          <button
            key={item.paper}
            onClick={() => setSelected(item)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#C9A96E]/50 hover:shadow-xl transition-all text-right"
          >
            <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '3 / 4' }}>
              <img
                src={item.image}
                alt={`صفحه اول ${item.paper}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <h3 className="font-extrabold text-sm text-[#1B365D] group-hover:text-[#C9A96E] transition-colors">{item.paper}</h3>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-2xl w-full max-h-[92vh] overflow-auto bg-white rounded-2xl p-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-black text-[#1B365D]">صفحه اول {selected.paper}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 font-bold">✕</button>
            </div>
            <img src={selected.image} alt={`صفحه اول ${selected.paper}`} className="w-full h-auto rounded-xl" />
          </div>
        </div>
      )}
    </>
  );
}
