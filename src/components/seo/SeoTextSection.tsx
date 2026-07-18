import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  q: string;
  a: string;
}

interface SeoTextSectionProps {
  heading: string;
  contentBlocks: Array<{ title: string; body: React.ReactNode }>;
  faqs?: FAQ[];
}

export default function SeoTextSection({ heading, contentBlocks, faqs }: SeoTextSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-dark mb-4">{heading}</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Long form text content */}
        <div className="prose prose-lg max-w-none text-gray-700 mb-20">
          {contentBlocks.map((block, i) => (
            <div key={i} className="mb-10">
              <h3 className="text-2xl font-heading font-bold text-dark mb-4">{block.title}</h3>
              <div className="leading-relaxed">{block.body}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <div className="mt-20">
            <h3 className="text-3xl font-heading font-bold text-dark mb-10 text-center">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-dark pr-4">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
