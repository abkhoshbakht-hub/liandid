import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/secure-a2x-admin', '/api/admin'],
      },
    ],
    sitemap: 'https://liandid.ir/sitemap.xml',
  };
}
