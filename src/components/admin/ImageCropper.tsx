'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  fileName: string;
  defaultAspect: string;
  outputWidth: number;
  quality: number;
  format: string;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}

const ASPECT_OPTIONS = [
  { value: '16:9', label: '۱۶:۹' },
  { value: '4:3', label: '۴:۳' },
  { value: '1:1', label: '۱:۱' },
  { value: 'free', label: 'آزاد' },
];

function parseAspect(value: string, iw: number, ih: number): number {
  if (value === '1:1') return 1;
  if (value === '4:3') return 4 / 3;
  if (value === 'free') return iw > 0 && ih > 0 ? iw / ih : 16 / 9;
  return 16 / 9;
}

export default function ImageCropper({ imageSrc, fileName, defaultAspect, outputWidth, quality, format, onDone, onCancel }: ImageCropperProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [frameW, setFrameW] = useState(0);
  const [aspectKey, setAspectKey] = useState(defaultAspect || '16:9');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ px: 0, py: 0, ox: 0, oy: 0 });
  const [processing, setProcessing] = useState(false);

  const aspect = parseAspect(aspectKey, nat.w, nat.h);
  const frameH = frameW > 0 ? frameW / aspect : 0;

  const baseScale = nat.w > 0 && frameW > 0 ? Math.max(frameW / nat.w, frameH / nat.h) : 1;
  const scale = baseScale * zoom;
  const dw = nat.w * scale;
  const dh = nat.h * scale;

  const clamp = useCallback((ox: number, oy: number) => {
    const minX = Math.min(frameW - dw, 0);
    const minY = Math.min(frameH - dh, 0);
    return {
      x: Math.max(minX, Math.min(0, ox)),
      y: Math.max(minY, Math.min(0, oy)),
    };
  }, [frameW, frameH, dw, dh]);

  useEffect(() => {
    const measure = () => {
      if (frameRef.current) setFrameW(frameRef.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (nat.w > 0 && frameW > 0) {
      setOffset({ x: (frameW - dw) / 2, y: (frameH - dh) / 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nat.w, nat.h, frameW, aspectKey]);

  const handleZoom = (z: number) => {
    const nz = Math.max(1, Math.min(3, z));
    const cx = (frameW / 2 - offset.x) / scale;
    const cy = (frameH / 2 - offset.y) / scale;
    const ns = baseScale * nz;
    setZoom(nz);
    setOffset(clamp(frameW / 2 - cx * ns, frameH / 2 - cy * ns));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset(clamp(
      dragStart.current.ox + (e.clientX - dragStart.current.px),
      dragStart.current.oy + (e.clientY - dragStart.current.py)
    ));
  };

  const onPointerUp = () => setDragging(false);

  const handleConfirm = async () => {
    const img = imgRef.current;
    if (!img || nat.w === 0) return;
    setProcessing(true);
    try {
      const outW = Math.min(outputWidth || 1280, 1920);
      const outH = Math.round(outW / aspect);
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas');
      const sx = -offset.x / scale;
      const sy = -offset.y / scale;
      const sw = frameW / scale;
      const sh = frameH / scale;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      const mime = format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg';
      const q = Math.max(0.1, Math.min(1, (quality || 80) / 100));
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, mime, q));
      if (blob) onDone(blob);
      else alert('خطا در برش عکس');
    } catch {
      alert('خطا در برش عکس');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg text-[#1B365D]">تنظیم عکس</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
        </div>

        <p className="text-xs text-gray-500 mb-3 leading-6">عکس را با موس یا انگشت بکشید تا کادر شود. با دکمه‌های کم و زیاد، اندازه را تنظیم کنید.</p>

        {/* قاب برش */}
        <div
          ref={frameRef}
          className="relative w-full overflow-hidden rounded-xl bg-gray-900 select-none"
          style={{ height: frameH || 240, cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt=""
              draggable={false}
              onLoad={e => setNat({ w: (e.target as HTMLImageElement).naturalWidth, h: (e.target as HTMLImageElement).naturalHeight })}
              className="absolute max-w-none"
              style={{ width: dw, height: dh, left: offset.x, top: offset.y, pointerEvents: 'none' }}
            />
          )}
          {/* خطوط راهنمای قاب */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
            <div className="absolute inset-0 border-2 border-[#C9A96E] rounded-xl" />
          </div>
        </div>

        {/* کم و زیاد */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => handleZoom(zoom - 0.2)} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-lg shrink-0">−</button>
          <input
            type="range" min={1} max={3} step={0.05}
            value={zoom}
            onChange={e => handleZoom(parseFloat(e.target.value))}
            className="flex-1 accent-[#C9A96E]"
          />
          <button onClick={() => handleZoom(zoom + 0.2)} className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-black text-lg shrink-0">+</button>
          <span className="text-xs text-gray-500 w-12 text-center shrink-0">{Math.round(zoom * 100)}٪</span>
        </div>

        {/* نسبت قاب */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-sm font-bold text-gray-700">قاب:</span>
          {ASPECT_OPTIONS.map(a => (
            <button
              key={a.value}
              onClick={() => { setAspectKey(a.value); setZoom(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${aspectKey === a.value ? 'bg-[#1B365D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handleConfirm} disabled={processing || nat.w === 0} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
            {processing ? 'در حال برش...' : 'تایید و آپلود'}
          </button>
          <button onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors">
            انصراف
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">{fileName}</p>
      </div>
    </div>
  );
}
