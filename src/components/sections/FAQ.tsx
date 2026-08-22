import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

interface FAQItem {
  question: string;
  answer: string;
  category: "customer" | "applicant";
}

const faqs: FAQItem[] = [
  {
    category: "customer",
    question: "Do you offer doorstep car cleaning service?",
    answer: "Yes, we are a 100% doorstep car care service. Our professional team will arrive directly at your home, office, or designated location fully equipped with our own premium supplies and state-of-the-art equipment."
  },
  {
    category: "customer",
    question: "What are the requirements for doorstep service?",
    answer: "We only require access to a standard electrical outlet and a water source within reasonable distance of your vehicle. Our team handles everything else, including premium agents and professional tools."
  },
  {
    category: "customer",
    question: "How long does a typical car service session take?",
    answer: "It depends on the service package. A standard care package takes about 45 minutes, Deep Interior care takes about 60 to 90 minutes, and our full Premium package with ceramic wax can take up to 2 to 3 hours depending on the car size and condition."
  },
  {
    category: "customer",
    question: "Are your cleaning agents safe for luxury car interiors?",
    answer: "Absolutely. We use premium, pH-balanced, biodegradable, and non-abrasive cleaning agents specifically designed for luxury materials, including premium leather, delicate alcantara, soft-touch plastics, and high-gloss wood or carbon finishes."
  },
  {
    category: "applicant",
    question: "Who can apply for the part-time job opportunities?",
    answer: "Our part-time opportunities are perfect for college students, freelancers, or anyone looking to earn extra, flexible income. No prior experience is required, as we provide complete, paid training."
  },
  {
    category: "applicant",
    question: "What are the typical working hours for part-time employees?",
    answer: "We offer flexible shifts of 5 to 6 hours daily. You can choose morning, afternoon, or evening blocks depending on your college classes, freelance schedule, or other personal commitments."
  },
  {
    category: "applicant",
    question: "How and when are part-time employees paid?",
    answer: "We offer a reliable monthly base payment of ₹4500 to ₹5000, along with excellent performance-based incentives for on-time completion, outstanding customer ratings, and bonus shifts."
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<"customer" | "applicant">("customer");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  const filteredFaqs = faqs.filter((faq) => faq.category === activeCategory);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#F8FAFC]" id="faq">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <ScrollReveal variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#0D3B8E] font-semibold tracking-wider uppercase text-sm mb-4 block">
              Got Questions?
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-dark mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-lg">
              Find quick answers to common questions about our doorstep car cleaning services and flexible part-time job opportunities.
            </p>
          </div>
        </ScrollReveal>

        {/* Category Tabs */}
        <ScrollReveal variant="fade-up" delay={0.1}>
          <div className="flex justify-center gap-4 mb-12">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory("customer");
                setOpenIndex(null);
              }}
              className={`px-6 py-3 rounded-full font-heading font-semibold text-sm transition-all duration-300 cursor-pointer ${
                activeCategory === "customer"
                  ? "bg-[#0D3B8E] text-white shadow-lg shadow-[#0D3B8E]/25"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              For Customers
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory("applicant");
                setOpenIndex(null);
              }}
              className={`px-6 py-3 rounded-full font-heading font-semibold text-sm transition-all duration-300 cursor-pointer ${
                activeCategory === "applicant"
                  ? "bg-[#0D3B8E] text-white shadow-lg shadow-[#0D3B8E]/25"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              For Job Applicants
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Accordion Container */}
        <ScrollReveal variant="scale-up" delay={0.15}>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: isLowEnd ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: isLowEnd ? 0 : -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                      <div
                        key={index}
                        className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 ${
                          isOpen ? "bg-[#0D3B8E]/5 border-[#0D3B8E]/20" : "bg-white"
                        }`}
                      >
                        <button
                          onClick={() => toggleAccordion(index)}
                          className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3B8E]/50 cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <span className="flex items-center gap-3 font-heading font-bold text-dark text-base md:text-lg">
                            <HelpCircle
                              size={20}
                              className={`shrink-0 transition-colors ${
                                isOpen ? "text-[#0D3B8E]" : "text-gray-400"
                              }`}
                            />
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray-500 shrink-0 transition-transform duration-300 ${
                              isOpen ? "rotate-180 text-[#0D3B8E]" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: prefersReducedMotion ? 0 : isLowEnd ? 0.2 : 0.3,
                                ease: "easeInOut",
                              }}
                            >
                              <div className="px-5 pb-5 pt-1 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100/50">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
