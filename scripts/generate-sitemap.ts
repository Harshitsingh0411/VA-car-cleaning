import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { seoLocations, seoServices } from '../src/data/seoData';
import { blogPosts } from '../src/data/blogData';

const DOMAIN = 'https://vacarcleaningservice.com';
const DIST_DIR = path.resolve(__dirname, '../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

async function generateSitemap() {
  console.log('Generating enterprise sitemap.xml...');

  const staticRoutes = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/services', priority: '0.9', changefreq: 'daily' },
    { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
    { url: '/subscription-plans', priority: '0.9', changefreq: 'weekly' },
    { url: '/book-now', priority: '0.9', changefreq: 'weekly' },
    { url: '/locations', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/help-center', priority: '0.8', changefreq: 'weekly' },
    { url: '/faqs', priority: '0.8', changefreq: 'weekly' },
    { url: '/reviews', priority: '0.8', changefreq: 'weekly' },
    { url: '/gallery', priority: '0.7', changefreq: 'weekly' },
    { url: '/jobs', priority: '0.7', changefreq: 'weekly' },
    { url: '/jobs/part-time', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
    { url: '/refund-policy', priority: '0.5', changefreq: 'yearly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Add Static Routes
  for (const item of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${item.url}</loc>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. Add Dynamic Location & Service Routes
  for (const service of seoServices) {
    const serviceRoute = `/services/${service.slug}`;
    xml += `  <url>\n    <loc>${DOMAIN}${serviceRoute}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    for (const location of seoLocations) {
      const combinedRoute = `/services/${service.slug}/kanpur/${location.slug}`;
      xml += `  <url>\n    <loc>${DOMAIN}${combinedRoute}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }
  }

  for (const location of seoLocations) {
    const locationRoute = `/kanpur/${location.slug}`;
    xml += `  <url>\n    <loc>${DOMAIN}${locationRoute}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // 3. Add Blog Posts
  for (const post of blogPosts) {
    const route = `/blog/${post.slug}`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route}</loc>\n`;
    xml += `    <lastmod>${post.date}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  // Write to dist if present
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.resolve(DIST_DIR, 'sitemap.xml'), xml);
  }
  // Write to public
  fs.writeFileSync(path.resolve(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log('sitemap.xml generated successfully in public and dist.');

  // Generate robots.txt
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /account
Disallow: /account/*
Disallow: /employee

Sitemap: ${DOMAIN}/sitemap.xml
`;
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.resolve(DIST_DIR, 'robots.txt'), robots);
  }
  fs.writeFileSync(path.resolve(PUBLIC_DIR, 'robots.txt'), robots);
  console.log('robots.txt generated successfully in public and dist.');
}

generateSitemap().catch(console.error);
