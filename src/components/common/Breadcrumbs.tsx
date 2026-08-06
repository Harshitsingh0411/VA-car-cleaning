import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { BASE_URL } from "../../utils/seoSchemas";

export interface BreadcrumbCrumb {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbCrumb[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ name: "Home", path: "/" }, ...items];

  // Microdata BreadcrumbList JSON-LD
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.path === "/" ? BASE_URL : `${BASE_URL}${item.path}`
    }))
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-gray-400 font-semibold overflow-x-auto py-2.5 px-4 bg-white/80 backdrop-blur-xs border border-gray-100 rounded-2xl shadow-2xs ${className}`}
    >
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1;
        return (
          <React.Fragment key={item.path + idx}>
            {idx > 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
            {isLast ? (
              <span className="text-primary font-bold truncate max-w-[180px]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
              >
                {idx === 0 && <Home size={12} className="text-gray-400 shrink-0" />}
                <span>{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
