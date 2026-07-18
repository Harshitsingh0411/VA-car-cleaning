import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { getBeforeAfterItems, dbBeforeAfterItem } from "../../services/dbService";

export default function BeforeAfter() {
  const [items, setItems] = useState<dbBeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBeforeAfterItems()
      .then((res) => {
        setItems(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch Before & After items:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white text-dark border-t border-gray-100" id="before-after">
        <div className="container mx-auto px-4 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white text-dark relative border-t border-gray-100" id="before-after">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
            — BEFORE & AFTER —
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-dark">
            See The Real Difference
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Experience our premium doorstep detailing quality compared to everyday grime and wear.
          </p>
        </div>

        {/* Clean Side-by-Side Comparison Showcase Grid */}
        <div className="space-y-12 max-w-5xl mx-auto">
          {items.map((item) => (
            <div key={item.id} className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#F4B400] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                    {item.category || "Detailing Transformation"}
                  </span>
                  <h3 className="text-xl font-heading font-extrabold text-dark">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 font-semibold">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BEFORE Card */}
                <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-lg border border-gray-200 group">
                  <img
                    src={item.beforeImage}
                    alt={`${item.title} Before`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute top-4 left-4 bg-black/70 text-white text-[11px] font-heading font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow">
                    Before Detailing
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs text-gray-300 font-medium block">Accumulated dirt, dust & grime</span>
                  </div>
                </div>

                {/* AFTER Card */}
                <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl border border-[#F4B400]/40 group">
                  <img
                    src={item.afterImage}
                    alt={`${item.title} After`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-[#F4B400] text-dark text-[11px] font-heading font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow flex items-center gap-1.5 font-extrabold">
                    <CheckCircle2 size={13} /> After VA Detailing
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs text-[#F4B400] font-bold block">100% Mirror Finish & Deep Clean</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
