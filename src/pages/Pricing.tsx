import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Info, ShieldCheck, Zap, Star, Trophy, Sparkles, Car } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { getAllPricingPlans, dbPricingPlan, DEFAULT_PRICING_PLANS } from "../services/dbService";

import SEO from "../components/seo/SEO";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"one-time" | "subscription">("one-time");
  const [plans, setPlans] = useState<dbPricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const fetched = await getAllPricingPlans();
        if (fetched && fetched.length > 0) {
          setPlans(fetched);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic pricing plans:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const renderIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case "zap":
        return <Zap className="text-blue-500" size={24} />;
      case "star":
        return <Star className="text-secondary" size={24} />;
      case "shield":
      case "shieldcheck":
        return <ShieldCheck className="text-primary" size={24} />;
      case "trophy":
        return <Trophy className="text-secondary" size={24} />;
      case "sparkles":
        return <Sparkles className="text-amber-500" size={24} />;
      default:
        return <Car className="text-primary" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <SEO 
        title="Car Cleaning Pricing & Packages | VaCar Kanpur"
        description="Affordable and transparent pricing for doorstep car washing, interior detailing, and ceramic coating in Kanpur. Choose one-time or subscription packages."
      />
      {/* Header Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-[11px] mb-2 block"
          >
            Pricing & Packages
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold max-w-3xl mx-auto leading-[1.1] tracking-tight mb-3"
          >
            Transparent Luxury Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Choose a custom-tailored package that perfectly aligns with your car cleaning and paint protection needs.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
        {/* Toggle billing option */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle("one-time")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                billingCycle === "one-time"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              One-Time Packages
            </button>
            <button
              onClick={() => setBillingCycle("subscription")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "subscription"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Subscription
              <span className="text-[10px] bg-secondary text-dark px-2 py-0.5 rounded-full font-bold">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const rawPrice = parseInt(plan.price.replace(/[^\d]/g, "")) || 0;
              const discountPercent = plan.subscriptionDiscountPercent ?? 15;
              const discountedNum = Math.round(rawPrice * (1 - discountPercent / 100));
              const adjustedPrice = billingCycle === "subscription"
                ? `₹${discountedNum}`
                : plan.price.startsWith("₹") ? plan.price : `₹${plan.price}`;

              return (
                <motion.div
                  key={plan.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`bg-white rounded-[32px] p-8 border relative flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 ${
                    plan.popular
                      ? "border-primary scale-105 ring-4 ring-primary/5 shadow-primary/10"
                      : "border-gray-100"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-bold text-xs uppercase px-4 py-1.5 rounded-full tracking-widest shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                        {renderIcon(plan.icon)}
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-xl text-dark">
                          {plan.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1.5 mb-8">
                      <span className="text-4xl font-black text-dark font-heading">
                        {adjustedPrice}
                      </span>
                      <span className="text-gray-400 text-sm font-semibold">
                        {billingCycle === "subscription" ? "/ month" : "/ visit"}
                      </span>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* List of features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/book" className="w-full mt-auto">
                    <Button
                      variant={plan.popular ? "primary" : "outline"}
                      className="w-full h-12 rounded-xl text-sm"
                    >
                      {plan.cta || "Book Now"}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quality Seal Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-dark text-white rounded-[32px] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between"
        >
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold mb-4">
              Need a completely custom detailing plan?
            </h3>
            <p className="text-gray-400 text-base md:text-lg">
              We offer customizable services for auto dealerships, corporate fleets, and specialized luxury car collectors. Contact our bespoke service team now.
            </p>
          </div>
          <a href="tel:+919876543210" className="shrink-0 w-full md:w-auto">
            <Button variant="secondary" className="w-full md:w-auto px-8 h-14 font-semibold">
              Contact Bespoke Detailing
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
