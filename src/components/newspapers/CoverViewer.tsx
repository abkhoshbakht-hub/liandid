'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CoverItem {
  id: string;
  imageUrl: string;
  paperName: string;
  persianDate: string;
  issueNumber?: string | null;
  slug?: string;
}

// ویوئر حرفه‌ای جلد: زوم، تمام‌صفحه، قبلی/بعدی — موبایل‌فرندلی
export default function CoverViewer({ items, index, onClose, onIndex }: { items: CoverItem[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const [zoom, setZoom] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const cur = items[index];

  const prev = useCallback(() => { setZoom(1); onIndex((index - 1 + items.length) % items.length); }, [index, items.length, onIndex]);
  const next = useCallback(() => { setZoom(1); onIndex((index + 1) % items.length); }, [index, items.length, onIndex]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') next(); // RTL: چپ = بعدی
      if (e.key === 'ArrowRight') prev();
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [next, prev, onClose]);

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else boxRef.current?.requestFullscreen?.().catch(() => {});
  }

  if (!cur) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" dir="rtl">
      <div className="flex items-center justify-between px-3 py-2 text-white shrink-0">
        <div className="text-sm font-bold truncate">{cur.paperName} — {cur.persianDate}{cur.issueNumber ? ` — شماره ${cur.issueNumber}` : ''}</div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="w-9 h-9 rounded-lg bg-white/10 text-xl font-bold">−</button>
          <button onClick={() => setZoom(1)} className="h-9 px-2 rounded-lg bg-white/10 text-xs">۱۰۰٪</button>
          <button onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))} className="w-9 h-9 rounded-lg bg-white/10 text-xl font-bold">+</button>
          <button onClick={fullscreen} className="w-9 h-9 rounded-lg bg-white/10" title="تمام‌صفحه">
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4m4 12v4h-4M4 16v4h4" /></svg>
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-red-600 font-bold">✕</button>
        </div>
      </div>
      <div ref={boxRef} className="flex-1 overflow-auto flex items-center justify-center relative bg-black">
        {items.length > 1 && (
          <>
            <button onClick={prev} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/15 text-white text-2xl">‹</button>
            <button onClick={next} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/15 text-white text-2xl">›</button>
          </>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cur.imageUrl}
          alt={`صفحه اول ${cur.paperName}`}
          className="m-auto transition-all"
          style={zoom === 1 ? { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } : { width: `${zoom * 90}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>
      <div className="text-center text-white/60 text-xs py-2 shrink-0">{index + 1} / {items.length}</div>
    </div>
  );
}
