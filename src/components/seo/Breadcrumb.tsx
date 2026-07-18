import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items?: Array<{ name: string; url: string }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // If items are manually provided (e.g. for dynamic slugs where we know the clean name)
  // Otherwise, auto-generate from path
  const breadcrumbItems = items || pathnames.map((value, index) => {
    const url = `/${pathnames.slice(0, index + 1).join('/')}`;
    // Format string: remove hyphens, capitalize
    const name = value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return { name, url };
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://vacarcleaningservice.com"
      },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": `https://vacarcleaningservice.com${item.url}`
      }))
    ]
  };

  return (
    <>
      {/* Inject BreadcrumbList JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <nav aria-label="Breadcrumb" className="w-full flex py-3 overflow-x-auto">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 whitespace-nowrap">
          <li>
            <Link to="/" className="flex items-center hover:text-primary transition-colors">
              <Home size={16} className="mr-1" />
              Home
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.url} className="flex items-center">
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                {isLast ? (
                  <span className="text-gray-900 font-semibold truncate max-w-[200px]" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link to={item.url} className="hover:text-primary transition-colors truncate max-w-[150px]">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
