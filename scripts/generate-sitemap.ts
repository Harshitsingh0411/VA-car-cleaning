import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// In an ES module environment, __dirname is not defined by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { seoLocations, seoServices } from '../src/data/seoData';
import { blogPosts } from '../src/data/blogData';

const DOMAIN = 'https://vacarcleaningservice.com';
const DIST_DIR = path.resolve(__dirname, '../dist');

async function generateSitemap() {
  console.log('Generating sitemap.xml...');

  const staticRoutes = [
    '',
    '/services',
    '/pricing',
    '/gallery',
    '/about',
    '/jobs',
    '/book',
    '/contact',
    '/blog'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Add Static Routes
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. Add Dynamic Location & Service Routes
  for (const service of seoServices) {
    const serviceRoute = `/services/${service.slug}`;
    xml += `  <url>\n    <loc>${DOMAIN}${serviceRoute}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    for (const location of seoLocations) {
      // Localized service route
      const combinedRoute = `/services/${service.slug}/kanpur/${location.slug}`;
      xml += `  <url>\n    <loc>${DOMAIN}${combinedRoute}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  }

  for (const location of seoLocations) {
    const locationRoute = `/kanpur/${location.slug}`;
    xml += `  <url>\n    <loc>${DOMAIN}${locationRoute}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // 3. Add Blog Posts
  for (const post of blogPosts) {
    const route = `/blog/${post.slug}`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${post.date}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  fs.writeFileSync(path.resolve(DIST_DIR, 'sitemap.xml'), xml);
  console.log('sitemap.xml generated successfully.');

  // Generate robots.txt
  console.log('Generating robots.txt...');
  const robots = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
  fs.writeFileSync(path.resolve(DIST_DIR, 'robots.txt'), robots);
  console.log('robots.txt generated successfully.');
}

generateSitemap().catch(console.error);
