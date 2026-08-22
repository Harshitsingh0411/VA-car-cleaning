import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BASE_URL, BRAND_NAME } from '../../utils/seoSchemas';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  image?: string;
  schemas?: Record<string, any>[];
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
}

export default function SEO({
  title = "VA Car & Bike Care | Premium Doorstep Car Care",
  description = "Budget-friendly doorstep car & bike care & monthly subscriptions in Kanpur. Pay on Delivery!",
  keywords = "car wash, doorstep car care, bike care kanpur, monthly car subscription, car care kanpur",
  canonicalUrl,
  type = "website",
  image = `${BASE_URL}/favicon.png`,
  schemas = [],
  noindex = false,
  author = "VA Car Care Team",
  publishedTime
}: SEOProps) {

  const fullTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;
  const truncatedDesc = description.length > 155 ? `${description.slice(0, 152)}...` : description;
  const currentCanonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : BASE_URL);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={truncatedDesc} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="theme-color" content="#0D3B8E" />

      {/* Robots Directive */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      <meta
        name="googlebot"
        content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"}
      />

      {/* Canonical Link */}
      <link rel="canonical" href={currentCanonical} />

      {/* Mobile & PWA App Meta */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="VA Car Care" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@vacarcare" />
      <meta name="twitter:creator" content="@vacarcare" />

      {/* JSON-LD Schemas */}
      {schemas.map((schemaObj, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaObj)}
        </script>
      ))}
    </Helmet>
  );
}
