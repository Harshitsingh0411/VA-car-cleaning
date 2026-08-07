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
  variant?: "dark" | "light";
}

export default function Breadcrumbs({ items, className = "", variant = "dark" }: BreadcrumbsProps) {
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

  const isLight = variant === "light";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`inline-flex items-center gap-2.5 text-xs font-semibold py-2 px-4.5 rounded-full backdrop-blur-xl transition-all duration-300 transform-gpu overflow-x-auto max-w-full shadow-2xl ${
        isLight
          ? "bg-white/95 text-gray-800 border border-gray-200/90 hover:border-[#0D3B8E]/50 shadow-gray-200/60"
          : "bg-[#0B1220]/95 text-white border border-[#F4B400]/40 hover:border-[#F4B400] shadow-[0_4px_25px_rgba(244,180,0,0.18)] hover:shadow-[0_4px_30px_rgba(244,180,0,0.3)]"
      } ${className}`}
    >
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1;
        return (
          <React.Fragment key={item.path + idx}>
            {idx > 0 && (
              <ChevronRight
                size={14}
                className={isLight ? "text-gray-400 shrink-0" : "text-[#F4B400]/70 shrink-0"}
              />
            )}
            {isLast ? (
              <span
                className={`inline-flex items-center gap-2 font-extrabold text-xs px-3.5 py-1 rounded-full border tracking-wide shrink-0 transition-all ${
                  isLight
                    ? "bg-[#0D3B8E]/10 text-[#0D3B8E] border-[#0D3B8E]/25 shadow-xs"
                    : "bg-gradient-to-r from-[#F4B400]/30 to-[#F4B400]/15 text-[#F4B400] border-[#F4B400]/60 shadow-[0_0_15px_rgba(244,180,0,0.25)]"
                }`}
                aria-current="page"
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLight ? "bg-[#0D3B8E]" : "bg-[#F4B400]"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLight ? "bg-[#0D3B8E]" : "bg-[#F4B400]"}`} />
                </span>
                <span className="truncate max-w-[180px] sm:max-w-[260px]">{item.name}</span>
              </span>
            ) : (
              <Link
                to={item.path}
                className={`transition-all flex items-center gap-1.5 shrink-0 font-bold ${
                  isLight
                    ? "text-gray-600 hover:text-[#0D3B8E]"
                    : "text-gray-200 hover:text-[#F4B400] hover:scale-105"
                }`}
              >
                {idx === 0 && (
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-transform hover:scale-110 ${
                      isLight
                        ? "bg-[#0D3B8E]/10 text-[#0D3B8E] border-[#0D3B8E]/20"
                        : "bg-[#F4B400] text-dark border-[#F4B400] shadow-[0_0_12px_rgba(244,180,0,0.4)]"
                    }`}
                  >
                    <Home size={12} className={isLight ? "" : "stroke-[2.5] text-dark"} />
                  </span>
                )}
                <span>{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
