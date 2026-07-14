import { useState } from "react";
import { motion } from "motion/react";
import { Check, Info, ShieldCheck, Zap, Star, Trophy } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter Package",
    description: "Great for quick, regular cleanups to maintain standard cleanliness.",
    price: "₹499",
    icon: <Zap className="text-blue-500" size={24} />,
    features: [
      "Eco foam exterior wash",
      "Wheel cleaning & shine",
      "Door frame wipe down",
      "Towel dried finish",
      "Standard dashboard dusting"
    ],
    popular: false,
    cta: "Book Starter"
  },
  {
    name: "Standard Package",
    description: "Highly requested for regular maintenance and light interior detailing.",
    price: "₹799",
    icon: <Star className="text-secondary" size={24} />,
    features: [
      "All Starter features",
      "Deep cabin vacuuming",
      "All footmats washed",
      "Dashboard polish & UV guard",
      "Interior glass clean & polish",
      "Odor neutralizing spray"
    ],
    popular: true,
    cta: "Book Standard"
  },
  {
    name: "Premium Detailing",
    description: "Our signature package to restore your vehicle to immaculate condition.",
    price: "₹1999",
    icon: <ShieldCheck className="text-primary" size={24} />,
    features: [
      "All Standard features",
      "Engine bay cleaning",
      "Seat stain spot extraction",
      "AC vent steam sterilization",
      "Liquid polymer paint wax coat",
      "Premium tire dressing"
    ],
    popular: false,
    cta: "Book Premium"
  },
  {
    name: "Gold Ultimate",
    description: "Elite service including professional gloss enhancement and total protection.",
    price: "₹4999",
    icon: <Trophy className="text-secondary" size={24} />,
    features: [
      "All Premium features",
      "9H Nano-ceramic coating layer",
      "Leather condition treatment",
      "Windshield hydrophobe treatment",
      "Alloy wheel restoration polish",
      "2-Year protection guarantee"
    ],
    popular: false,
    cta: "Book Gold Ultimate"
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"one-time" | "subscription">("one-time");

  return (
    <div className="pt-24 min-h-screen bg-light">
      {/* Header Banner */}
      <div className="bg-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-sm mb-4 block"
          >
            Pricing & Packages
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-extrabold mb-6"
          >
            Transparent Luxury Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Choose a custom-tailored package that perfectly aligns with your car cleaning and paint protection needs.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        {/* Toggle billing option */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-1">
            <button
              onClick={() => setBillingCycle("one-time")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                billingCycle === "one-time"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              One-Time Packages
            </button>
            <button
              onClick={() => setBillingCycle("subscription")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const adjustedPrice = billingCycle === "subscription" 
              ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 0.85)}`
              : plan.price;

            return (
              <motion.div
                key={index}
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
                      {plan.icon}
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
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

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
