/**
 * Comprehensive Schema.org JSON-LD Generators for Enterprise SEO & Google Sitelinks
 */

export const BASE_URL = "https://vacarcleaningservice.com";
export const BRAND_NAME = "VA Car & Bike Care";
export const LOGO_URL = `${BASE_URL}/favicon.png`;

export interface BreadcrumbItem {
  name: string;
  url?: string;
  path?: string;
}

/**
 * 1. WebSite Schema with Sitelinks SearchBox
 */
export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  "url": BASE_URL,
  "name": BRAND_NAME,
  "alternateName": ["VA Car Care", "VA Bike Care", "VaCar"],
  "description": "Premium doorstep car and bike care services in Kanpur. Zero advance payment required.",
  "publisher": {
    "@id": `${BASE_URL}/#organization`
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/services?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-IN"
});

/**
 * 2. Organization & LocalBusiness (AutomotiveBusiness) Schema
 */
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["AutoWash", "AutomotiveBusiness", "LocalBusiness"],
  "@id": `${BASE_URL}/#organization`,
  "name": BRAND_NAME,
  "legalName": "VA Car & Bike Care Services",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": LOGO_URL,
    "width": 192,
    "height": 192
  },
  "image": [
    `${BASE_URL}/favicon.png`,
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1200"
  ],
  "telephone": "+91 95699 49626",
  "email": "support@vacarcleaning.in",
  "priceRange": "₹₹",
  "paymentAccepted": "Cash, UPI, Credit Card, Debit Card, Net Banking",
  "currenciesAccepted": "INR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Civil Lines, Swaroop Nagar, Kidwai Nagar",
    "addressLocality": "Kanpur",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "208001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 26.4499,
    "longitude": 80.3319
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Kanpur"
    },
    {
      "@type": "AdministrativeArea",
      "name": "Uttar Pradesh"
    }
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91 95699 49626",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": ["en", "hi"]
  },
  "sameAs": [
    "https://facebook.com/vacarcare",
    "https://instagram.com/vacarcare",
    "https://youtube.com/vacarcare"
  ]
});

/**
 * 3. BreadcrumbList Schema
 */
export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => {
    const rawTarget = item.url || item.path || "/";
    return {
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": rawTarget.startsWith("http") ? rawTarget : `${BASE_URL}${rawTarget}`
    };
  })
});

/**
 * 4. Service & Product Schema
 */
export const getServiceSchema = (
  serviceName: string,
  description: string,
  price: number,
  imageUrl?: string
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": serviceName,
  "serviceType": "Doorstep Vehicle Cleaning & Detailing",
  "provider": {
    "@id": `${BASE_URL}/#organization`
  },
  "areaServed": {
    "@type": "City",
    "name": "Kanpur"
  },
  "description": description,
  "offers": {
    "@type": "Offer",
    "price": price,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": `${BASE_URL}/services`,
    "seller": {
      "@id": `${BASE_URL}/#organization`
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Doorstep Detailing Catalog",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": serviceName
        }
      }
    ]
  },
  "image": imageUrl || LOGO_URL
});

/**
 * 5. FAQPage Schema
 */
export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

/**
 * 6. Review & AggregateRating Schema
 */
export const getReviewSchema = (reviews: { author: string; rating: number; review: string; date: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "VA Doorstep Car & Bike Cleaning Service",
  "description": "Professional doorstep car and bike care service and ceramic protection.",
  "brand": {
    "@type": "Brand",
    "name": BRAND_NAME
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": reviews.length > 0 ? reviews.length.toString() : "125",
    "bestRating": "5"
  },
  "review": reviews.map(r => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": r.author
    },
    "datePublished": r.date,
    "reviewBody": r.review,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": r.rating,
      "bestRating": "5"
    }
  }))
});

/**
 * 7. Article / BlogPosting Schema
 */
export const getArticleSchema = (post: {
  title: string;
  description: string;
  author: string;
  date: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.description,
  "image": post.image || LOGO_URL,
  "author": {
    "@type": "Person",
    "name": post.author
  },
  "publisher": {
    "@id": `${BASE_URL}/#organization`
  },
  "datePublished": post.date,
  "dateModified": post.date,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": post.url.startsWith("http") ? post.url : `${BASE_URL}${post.url}`
  }
});
