import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.mehrnews.com' },
      { protocol: 'https', hostname: 'img9.irna.ir' },
      { protocol: 'https', hostname: 'www.irna.ir' },
      { protocol: 'https', hostname: 'www.mehrnews.com' },
      { protocol: 'https', hostname: 'media.isna.ir' },
      { protocol: 'https', hostname: 'www.isna.ir' },
      { protocol: 'https', hostname: 'media.farsnews.ir' },
      { protocol: 'https', hostname: 'www.farsnews.ir' },
      { protocol: 'https', hostname: 'media.tasnimnews.com' },
      { protocol: 'https', hostname: 'www.tasnimnews.com' },
      { protocol: 'https', hostname: 'bashgah.net' },
      { protocol: 'https', hostname: 'asrebooshehr.ir' },
      { protocol: 'https', hostname: 'booshehr.ir' },
      { protocol: 'https', hostname: 'boresseir.com' },
      { protocol: 'https', hostname: 'www.boresseir.com' },
      { protocol: 'https', hostname: 'booshahr24.ir' },
      { protocol: 'https', hostname: 'youngpress.ir' },
    ],
  },
};

export default nextConfig;
