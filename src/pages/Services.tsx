import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplets, Sparkles, ShieldCheck, Car, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import BookingSection from "../components/sections/BookingSection";
import SEO from "../components/seo/SEO";
import SeoTextSection from "../components/seo/SeoTextSection";
import { getAllServices, dbService, subscribeToDataChanges } from "../services/dbService";

export default function ServicesPage() {
  const [services, setServices] = useState<dbService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = () => {
    getAllServices()
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load services:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
    const unsubscribe = subscribeToDataChanges((topic) => {
      if (!topic || topic === "all" || topic === "services") {
        fetchServices();
      }
    });
    return () => unsubscribe();
  }, []);

  const getServiceIcon = (id: string, name: string) => {
    const lower = (id + " " + name).toLowerCase();
    if (lower.includes("subscription") || lower.includes("car")) return <Car size={36} />;
    if (lower.includes("foam") || lower.includes("wash") || lower.includes("droplet")) return <Droplets size={36} />;
    if (lower.includes("ceramic") || lower.includes("shield")) return <ShieldCheck size={36} />;
    return <Sparkles size={36} />;
  };

  const getServiceBenefits = (name: string, desc: string) => {
    const lower = (name + " " + desc).toLowerCase();
    if (lower.includes("bike") || lower.includes("scooter") || lower.includes("superbike")) {
      return [
        "Snow foam bath & pressure rinse",
        "Tyre & wheel rim degreasing",
        "Chain cleaning & lube application",
        "Matte / Gloss spray polish"
      ];
    }
    if (lower.includes("subscription")) {
      return [
        "Daily cloth wipe",
        "1 full wash per week",
        "Priority scheduling",
        "Interior dusting"
      ];
    }
    return [
      "Exterior body wash",
      "Tyre & wheel cleaning",
      "Dashboard dust cleaning",
      "Glass cleaning & microfiber drying"
    ];
  };

  return (
    <div className="min-h-screen bg-light">
      <SEO 
        title="Car & Bike Detailing Services | Doorstep Cleaning In Budget"
        description="Explore budget-friendly car and bike doorstep cleaning services in Kanpur including bike snow foam wash at ₹149, monthly bike subscriptions at ₹399, and superbike chain detailing."
      />
      {/* Hero Header */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-[11px] mb-2 block"
          >
            Our Offerings
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold max-w-3xl mx-auto leading-[1.1] tracking-tight mb-3"
          >
            Professional Detailing Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Explore our comprehensive list of specialized car cleaning, restoration, and long-term protection services.
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 font-semibold mt-4">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-sm">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">No Services Available</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              There are currently no active detailing services listed. You can manage and add custom services from the Admin panel.
            </p>
            <Link to="/book">
              <Button>Book Custom Detailing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {services.map((service, index) => {
              const benefits = getServiceBenefits(service.name, service.description);
              const icon = getServiceIcon(service.id, service.name);
              const serviceSlug = service.id || service.name.toLowerCase().replace(/\s+/g, "-");

              return (
                <motion.div
                  key={service.id || index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col lg:flex-row gap-12 items-center bg-white p-6 md:p-10 rounded-[32px] shadow-xl ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Service Image */}
                  <div className="w-full lg:w-1/2 h-[350px] rounded-2xl overflow-hidden relative shadow-lg group">
                    <img
                      src={service.image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                    <div className="absolute top-6 left-6 bg-primary text-white p-4 rounded-2xl shadow-xl">
                      {icon}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="w-full lg:w-1/2">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h2 className="text-3xl font-heading font-extrabold text-dark">
                        {service.name}
                      </h2>
                      <span className="text-2xl font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                        ₹{service.price}
                      </span>
                    </div>

                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Benefits Checklists */}
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-4">
                        What is included
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2.5">
                            <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Duration & Call to Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span className="text-xs uppercase tracking-wider text-gray-400">Duration:</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-dark font-semibold">
                          {service.name.toLowerCase().includes("subscription") ? "1 Month" : "60 Mins"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <Link to={`/services/${service.id}`} className="w-full sm:w-auto">
                          <Button variant="outline" className="w-full sm:w-auto border-gray-200 hover:border-primary">View Webpage ↗</Button>
                        </Link>
                        <Link to={`/book?service=${service.id}`} className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto">Book This Service</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BookingSection />

      <SeoTextSection 
        heading="Comprehensive Car Detailing Services in Kanpur"
        contentBlocks={[
          {
            title: "Why Choose Our Professional Car Cleaning Services?",
            body: <p>Our doorstep car detailing services are designed to restore your vehicle to its showroom condition. From basic exterior foam washes that strip away road grime to intensive interior dry cleaning that eliminates bacteria and odors, our certified detailers handle it all. We use state-of-the-art equipment, including high-pressure washers, steam cleaners, and industrial extractors.</p>
          },
          {
            title: "Advanced 9H Ceramic Coating",
            body: <p>Protect your car's paint from UV rays, acid rain, and minor scratches with our premium 9H Ceramic Coating service. This liquid polymer chemically bonds with your vehicle's factory paint, creating a protective layer that lasts for years. The hydrophobic properties ensure water beads up and rolls off, keeping your car cleaner for longer and making future washes a breeze.</p>
          }
        ]}
        faqs={[
          {
            q: "Do you offer subscription-based monthly car cleaning?",
            a: "Yes! We offer discounted monthly packages that include weekly exterior washes and a bi-weekly interior vacuum to keep your car looking pristine year-round."
          },
          {
            q: "What is the difference between a normal wash and a foam wash?",
            a: "A normal wash usually involves applying soap with a sponge, which can trap dirt and scratch the paint. Our foam wash uses a snow foam cannon that encapsulates dirt and lifts it off the surface safely before we even touch the paint."
          }
        ]}
      />
    </div>
  );
}
