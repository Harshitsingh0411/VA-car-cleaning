import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
  location?: string;
}

export default function SEO({
  title = 'Best Doorstep Car Cleaning & Detailing Service in Kanpur',
  description = 'Premium mobile car cleaning, foam wash, interior dry cleaning, and ceramic coating at your doorstep in Kanpur. Book online for professional, eco-friendly car care.',
  keywords = 'doorstep car cleaning, car wash kanpur, car detailing kanpur, foam wash, interior cleaning, mobile car wash',
  canonicalUrl = 'https://vacarcleaningservice.com',
  type = 'website',
  image = 'https://vacarcleaningservice.com/assets/og-image.jpg',
  schema,
  location = 'Kanpur, Uttar Pradesh',
}: SEOProps) {
  
  // Base LocalBusiness schema for VaCar
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoWash',
    name: 'VaCar Cleaning Service',
    image: image,
    '@id': 'https://vacarcleaningservice.com',
    url: 'https://vacarcleaningservice.com',
    telephone: '+91 8090757262', // Generic phone based on previously seen info
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kanpur',
      addressLocality: location,
      addressRegion: 'UP',
      postalCode: '208001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.4499,
      longitude: 80.3319,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '08:00',
      closes: '20:00',
    },
    priceRange: '₹₹',
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title} | VaCar</title>
      <meta name="title" content={`${title} | VaCar Cleaning Service`} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="theme-color" content="#F4B400" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={`${title} | VaCar Cleaning Service`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="VaCar Cleaning Service" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={`${title} | VaCar Cleaning Service`} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data JSON-LD */}
      {finalSchema && (
        <script type="application/ld+json">
          {JSON.stringify(finalSchema)}
        </script>
      )}
    </Helmet>
  );
}
