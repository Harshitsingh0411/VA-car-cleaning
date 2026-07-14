import { motion } from "motion/react";
import { Droplet, Sparkles, Zap, Award, Car, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

import { servicePrices } from "../../lib/prices";

const defaultServices = [
  {
    id: 1,
    title: "Exterior Wash",
    key: "exterior",
    description: "High pressure foam wash for exterior body.",
    priceDefault: "₹299",
    icon: <Droplet size={22} className="text-white" />,
    iconBg: "bg-blue-500",
    imageDefault: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "Interior Cleaning",
    key: "interior",
    description: "Deep cleaning of seats, floor & interior.",
    priceDefault: "₹599",
    icon: <Sparkles size={22} className="text-white" />,
    iconBg: "bg-amber-500",
    imageDefault: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Foam Wash",
    key: "foam",
    description: "Premium foam wash for deep cleaning.",
    priceDefault: "₹499",
    icon: <Zap size={22} className="text-white" />,
    iconBg: "bg-cyan-500",
    imageDefault: "https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Wax Polish",
    key: "wax",
    description: "Protects your car paint & gives extra shine.",
    priceDefault: "₹799",
    icon: <Award size={22} className="text-white" />,
    iconBg: "bg-red-500",
    imageDefault: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    title: "Dashboard Cleaning",
    key: "dashboard",
    description: "Shine & protection for your dashboard.",
    priceDefault: "₹199",
    icon: <Car size={22} className="text-white" />,
    iconBg: "bg-purple-500",
    imageDefault: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800"
  }
];

export default function Services() {
  // Dynamic pricing mapper
  const getServicePrice = (key: string, defaultPrice: string) => {
    const keyMap: Record<string, string> = {
      exterior: "exteriorWash",
      interior: "interiorCleaning",
      foam: "foamWash",
      wax: "waxPolish",
      dashboard: "dashboardCleaning",
      tyre: "tyreDressing"
    };
    const mappedKey = keyMap[key];
    if (mappedKey && servicePrices[mappedKey]) {
      return servicePrices[mappedKey].formatted;
    }
    return defaultPrice;
  };

  // Dynamic image loader
  const getServiceImage = (key: string, defaultImg: string) => {
    try {
      const overridesRaw = localStorage.getItem("admin_service_images");
      if (overridesRaw) {
        const overrides = JSON.parse(overridesRaw);
        if (overrides[key]) return overrides[key];
      }
    } catch (e) {}
    return defaultImg;
  };

  // Dynamic description loader
  const getServiceDesc = (key: string, defaultDesc: string) => {
    try {
      const overridesRaw = localStorage.getItem("admin_service_descriptions");
      if (overridesRaw) {
        const overrides = JSON.parse(overridesRaw);
        if (overrides[key]) return overrides[key];
      }
    } catch (e) {}
    return defaultDesc;
  };

  const homepageServices = defaultServices.map((s) => ({
    ...s,
    price: getServicePrice(s.key, s.priceDefault),
    image: getServiceImage(s.key, s.imageDefault),
    description: getServiceDesc(s.key, s.description)
  }));

  return (
    <section className="py-24 bg-[#070C16] text-white relative border-t border-white/5" id="services">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">
              — OUR SERVICES —
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight">
              Premium Cleaning & Detailing Services
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
              We use the best products and techniques to make your vehicle look brand new.
            </p>
          </div>
          <Link to="/services">
            <Button variant="outline" className="text-white border-white/10 hover:border-white/40 hover:bg-white/5 py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2">
              View All Services
              <ArrowRight size={14} className="text-[#F4B400]" />
            </Button>
          </Link>
        </div>

        {/* Services Cards Horizontal Grid scrollable or flex wrap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {homepageServices.map((service, index) => (
            <Link
              key={service.id}
              to={`/book?service=${service.key}`}
              className="flex"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group hover:-translate-y-2 cursor-pointer flex flex-col justify-between w-full"
              >
                {/* Image with icon overlay */}
                <div className="relative h-44 overflow-hidden shrink-0">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Floating Circle Icon */}
                  <div className={`absolute -bottom-4 left-6 w-10 h-10 ${service.iconBg} rounded-full flex items-center justify-center border-2 border-white shadow-md z-10 group-hover:rotate-12 transition-transform`}>
                    {service.icon}
                  </div>
                </div>

                {/* Service description details */}
                <div className="p-6 pt-8 flex-1 flex flex-col justify-between text-dark">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-heading font-extrabold tracking-tight group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[15px] font-heading font-black text-dark">
                      {service.price}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      Starting From
                    </span>
                  </div>
                </div>

              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
