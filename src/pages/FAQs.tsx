import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, 
  HelpCircle, 
  ArrowLeft, 
  Search, 
  Mail, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Tag, 
  Car, 
  Briefcase, 
  LayoutGrid, 
  Clock, 
  CheckSquare, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldCheck 
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getFAQSchema, getBreadcrumbSchema } from "../utils/seoSchemas";

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Booking" | "Pricing" | "Services" | "Jobs";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const faqsList: FAQItem[] = [
  {
    category: "Services",
    question: "Do you offer doorstep car cleaning service?",
    answer: "Yes, we are a 100% doorstep car care service. Our professional team will arrive directly at your home, office, or designated location fully equipped with our own premium supplies and state-of-the-art equipment.",
    icon: Car
  },
  {
    category: "Services",
    question: "What are the requirements for doorstep service?",
    answer: "We only require access to a standard electrical outlet and a water source within reasonable distance of your vehicle. Our team handles everything else, including premium agents and professional tools.",
    icon: CheckSquare
  },
  {
    category: "Services",
    question: "How long does a car wash take?",
    answer: "It depends on the package selected. A standard Hatchback or Sedan treatment takes about 45-60 minutes, whereas an SUV Ceramic Waxing session may take between 2 to 3 hours.",
    icon: Clock
  },
  {
    category: "General",
    question: "Are your cleaning agents safe for luxury car interiors?",
    answer: "Absolutely. We use premium, pH-balanced, biodegradable, and non-abrasive cleaning agents specifically designed for luxury materials, including premium leather, delicate alcantara, and high-gloss wood trim.",
    icon: HelpCircle
  },
  {
    category: "Booking",
    question: "Can I reschedule or cancel my booking?",
    answer: "Yes! You can reschedule or cancel your bookings up to 2 hours before the scheduled time slot directly from your Account dashboard without any penalty.",
    icon: Calendar
  },
  {
    category: "Pricing",
    question: "Do you have monthly cleaning subscription packages?",
    answer: "Yes, we offer monthly subscription plans starting at ₹399 for bikes and ₹799 for cars. These include weekly maintenance care to keep your vehicle pristine year-round.",
    icon: Tag
  },
  {
    category: "Pricing",
    question: "Is there any extra fee for doorstep delivery in distant areas?",
    answer: "Our doorstep delivery is completely free within our operational city limits (Kanpur). Areas located outside standard city boundaries might incur a minimal distance surcharge.",
    icon: Tag
  },
  {
    category: "Jobs",
    question: "Who can apply for the part-time job opportunities?",
    answer: "Our part-time opportunities are perfect for college students, freelancers, or anyone looking to earn extra, flexible income. No prior experience is required, as we provide complete, paid training.",
    icon: Briefcase
  },
  {
    category: "Jobs",
    question: "What is the typical pay structure for crew members?",
    answer: "We offer a reliable monthly base payment of ₹4,500 to ₹5,000, along with excellent performance-based incentives for on-time completion, outstanding customer ratings, and bonus shifts.",
    icon: Briefcase
  }
];

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<"All" | "General" | "Booking" | "Pricing" | "Services" | "Jobs">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [helpfulFeedbacks, setHelpfulFeedbacks] = useState<Record<number, "yes" | "no">>({});

  const filteredFaqs = faqsList.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (catId: string) => {
    if (catId === "All") return faqsList.length;
    return faqsList.filter(f => f.category === catId).length;
  };

  const handleFeedback = (idx: number, type: "yes" | "no") => {
    setHelpfulFeedbacks(prev => ({ ...prev, [idx]: type }));
  };

  const categories = [
    { id: "All" as const, label: "All", sub: "All Topics", icon: LayoutGrid },
    { id: "General" as const, label: "General", sub: "General help", icon: HelpCircle },
    { id: "Booking" as const, label: "Booking", sub: "Reservations", icon: Calendar },
    { id: "Pricing" as const, label: "Pricing", sub: "Plans & Surcharges", icon: Tag },
    { id: "Services" as const, label: "Services", sub: "Detaling & wash", icon: Car },
    { id: "Jobs" as const, label: "Jobs", sub: "Work with us", icon: Briefcase }
  ];

  const breadcrumbs = [{ name: "FAQ & Help Center", path: "/faq" }];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 text-left relative">
      <SEO 
        title="Frequently Asked Questions (FAQ) | VA Car & Bike Care"
        description="Got questions about our doorstep car cleaning, monthly wash subscriptions, or part-time job opportunities? Browse our frequently asked questions."
        keywords="car wash faq, doorstep detailing questions, car cleaning subscription cost, bike wash kanpur faq"
        schemas={[
          getBreadcrumbSchema(breadcrumbs),
          getFAQSchema(faqsList.map(f => ({ question: f.question, answer: f.answer })))
        ]}
      />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-6">
        
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Header */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
                <HelpCircle size={20} />
              </div>
              <span className="text-primary font-bold uppercase tracking-wider text-[10px]">Help Center</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-dark">Frequently Asked Questions</h1>
              <p className="text-gray-400 text-xs mt-1">Search or browse categories below to find quick answers about our services, bookings, and policies.</p>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-3 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-dark placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="shrink-0 hidden md:block select-none">
            <svg className="w-40 h-40 drop-shadow-xl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="30" width="130" height="110" rx="30" fill="url(#paint0_linear)" />
              <path d="M50 140L35 170L75 140H50Z" fill="url(#paint0_linear)" />
              <text x="85" y="105" fill="white" fontSize="60" fontWeight="bold" textAnchor="middle">?</text>
              
              <rect x="100" y="100" width="80" height="60" rx="20" fill="white" className="filter drop-shadow-md" />
              <path d="M120 160L110 180L140 160H120Z" fill="white" />
              <circle cx="125" cy="130" r="4" fill="#94A3B8" />
              <circle cx="140" cy="130" r="4" fill="#94A3B8" />
              <circle cx="155" cy="130" r="4" fill="#94A3B8" />
              
              <path d="M170 60L175 45L180 60L195 65L180 70L175 85L170 70L155 65L170 60Z" fill="#FBBF24" />
              <path d="M15 80L18 72L21 80L29 83L21 86L18 94L15 86L7 83L15 80Z" fill="#FBBF24" />

              <defs>
                <linearGradient id="paint0_linear" x1="20" y1="30" x2="150" y2="140" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3B82F6" />
                  <stop stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Category Selector Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            const qCount = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`p-4 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between h-28 hover:scale-[1.02] ${
                  isActive 
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-[#0F172A] border-gray-100 hover:border-primary/20 shadow-2xs"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/15" : "bg-[#EEF5FE] text-primary"}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs">{cat.label}</h4>
                  <p className={`text-[10px] font-semibold mt-0.5 ${isActive ? "text-blue-100" : "text-gray-400"}`}>
                    {qCount} {qCount === 1 ? "Question" : "Questions"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Two-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-xs">
                <span className="text-3xl block mb-2">🔍</span>
                <h4 className="text-dark font-extrabold text-sm">No Answers Found</h4>
                <p className="text-gray-400 text-xs mt-1">Try modifying your keywords or search in another category.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const IconComponent = faq.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-primary/10 shadow-2xs hover:shadow-xs transition-all"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left font-heading font-extrabold text-[#0F172A] text-sm hover:text-primary transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-[#EEF5FE] text-primary flex items-center justify-center shrink-0">
                          <IconComponent size={18} />
                        </div>
                        <span>{faq.question}</span>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-14 pt-3.5 pb-1 space-y-4">
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                              {faq.answer}
                            </p>
                            
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-50 text-xs text-gray-500 font-medium">
                              <span>Was this answer helpful?</span>
                              <button 
                                onClick={() => handleFeedback(idx, "yes")}
                                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                  helpfulFeedbacks[idx] === "yes"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                                }`}
                              >
                                <ThumbsUp size={11} />
                                <span>Yes</span>
                              </button>
                              <button 
                                onClick={() => handleFeedback(idx, "no")}
                                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                  helpfulFeedbacks[idx] === "no"
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                                }`}
                              >
                                <ThumbsDown size={11} />
                                <span>No</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xs text-left space-y-5">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0">
                  <HelpCircle size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-[#0F172A]">Need More Help?</h4>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Can't find what you're looking for? Our support team is here for you.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a 
                  href="https://wa.me/919569949626"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 border border-emerald-100/50 bg-[#ECFDF5]/50 hover:bg-[#ECFDF5] rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-[#0F172A]">Chat on WhatsApp</h5>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Get instant help</p>
                  </div>
                </a>

                <a 
                  href="tel:+919569949626"
                  className="flex items-center gap-3.5 p-3.5 border border-blue-50 bg-blue-50/20 hover:bg-blue-50/50 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-[#0F172A]">Call Us</h5>
                    <p className="text-[10px] text-primary font-bold mt-0.5">+91 95699 49626</p>
                  </div>
                </a>

                <a 
                  href="mailto:support@vacarcare.com"
                  className="flex items-center gap-3.5 p-3.5 border border-amber-100 bg-amber-50/20 hover:bg-amber-50/50 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F4B400] text-dark flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-[#0F172A]">Email Us</h5>
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">support@vacarcare.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 p-3.5 border border-gray-100 bg-gray-50/30 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-gray-200/80 text-gray-600 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-[#0F172A]">Support Hours</h5>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Mon - Sun: 8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
