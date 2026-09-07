'use client';

import { useState } from 'react';

interface HeroImageProps {
  src: string;
  alt: string;
  hoverZoom?: boolean;
}

// عکس افقی: تمام قاب را پر می‌کند. عکس عمودی (موبایلی): کامل با پس‌زمینه محو نمایش داده می‌شود تا سر جایش بنشیند
export default function HeroImage({ src, alt, hoverZoom }: HeroImageProps) {
  const [portrait, setPortrait] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a1628]">
      {portrait && (
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ filter: 'blur(24px) brightness(0.5)', transform: 'scale(1.15)' }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={e => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0) setPortrait(img.naturalHeight > img.naturalWidth);
        }}
        className={
          portrait
            ? 'absolute inset-0 w-full h-full object-contain'
            : `absolute inset-0 w-full h-full object-cover object-center${hoverZoom ? ' transition-transform duration-700 group-hover:scale-105' : ''}`
        }
      />
    </div>
  );
}
