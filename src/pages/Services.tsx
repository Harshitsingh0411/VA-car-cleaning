import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplets, Sparkles, ShieldCheck, Car, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import BookingSection from "../components/sections/BookingSection";
import SEO from "../components/seo/SEO";
import SeoTextSection from "../components/seo/SeoTextSection";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getAllServices, dbService, subscribeToDataChanges } from "../services/dbService";
import { getBreadcrumbSchema, getServiceSchema } from "../utils/seoSchemas";

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

  const breadcrumbs = [{ name: "Services", path: "/services" }];
  const schemas = [
    getBreadcrumbSchema(breadcrumbs),
    ...services.map(s => getServiceSchema(s.name, s.description, s.price, s.image))
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16">
      <SEO 
        title="Car & Bike Care Services | Doorstep Care In Budget"
        description="Explore budget-friendly car and bike doorstep care services in Kanpur including monthly bike subscriptions at ₹399, and superbike chain care."
        keywords="car wash pricing, bike cleaning kanpur, doorstep car care, ceramic coating"
        schemas={schemas}
      />



      {/* 3. Catalog Section Grid */}
      <div className="container mx-auto px-4 md:px-6 mb-12">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 font-semibold mt-4 text-xs">Loading services catalog...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-xs border border-gray-100">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">No Services Available</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              There are currently no active detailing services listed. Please check back later.
            </p>
            <Link to="/book">
              <Button>Book Custom Detailing</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-heading font-extrabold text-dark">Care Packages</h2>
              <p className="text-gray-400 text-xs mt-0.5">Choose from our selected service catalog below and order doorstep care instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const stepNum = String(index + 1).padStart(2, "0");
                const icon = getServiceIcon(service.id, service.name);
                const isSubscription = service.name.toLowerCase().includes("subscription");
                
                return (
                  <motion.div 
                    key={service.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className="space-y-4">
                      {/* Image Frame */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <img 
                          src={service.image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"} 
                          alt={service.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent" />
                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md z-10 shadow-sm">{stepNum}</span>
                        <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md z-10 shadow-sm">ACTIVE</span>
                        <div className="absolute -bottom-4 left-4 w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center shadow-md border border-gray-100 z-10">
                          {icon}
                        </div>
                      </div>

                      {/* Header and Details */}
                      <div className="pt-2 flex justify-between items-start gap-3">
                        <h3 className="font-heading font-extrabold text-dark text-sm leading-snug">{service.name}</h3>
                        <div className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl text-center shrink-0">
                          <span className="block text-primary font-black text-xs leading-none">₹{service.price}</span>
                          <span className="text-[7px] font-extrabold text-blue-400 uppercase tracking-wider block mt-0.5">{isSubscription ? "Monthly" : "Starting"}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{service.description}</p>
                    </div>

                    {/* Action Row */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link to={`/services/${service.id}`} className="flex-grow">
                        <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 px-3 rounded-xl text-xs border border-gray-200 cursor-pointer transition-colors text-center">
                          View Details
                        </button>
                      </Link>
                      <Link to={`/book?service=${service.id}`} className="flex-grow">
                        <button className="w-full bg-primary hover:bg-[#0b327b] text-white font-bold py-2 px-3 rounded-xl text-xs cursor-pointer shadow-xs transition-colors text-center">
                          Book Now
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BookingSection />

      <SeoTextSection 
        heading="Comprehensive Car Care Services in Kanpur"
        contentBlocks={[
          {
            title: "Why Choose Our Professional Car Cleaning Services?",
            body: <p>Our doorstep car care services are designed to restore your vehicle to its showroom condition. From basic exterior treatments that strip away road grime to intensive interior care that eliminates bacteria and odors, our certified technicians handle it all. We use state-of-the-art equipment, including high-pressure washers, steam cleaners, and industrial extractors.</p>
          },
          {
            title: "Advanced 9H Ceramic Coating",
            body: <p>Protect your car's paint from UV rays, acid rain, and minor scratches with our premium 9H Ceramic Coating service. This liquid polymer chemically bonds with your vehicle's factory paint, creating a protective layer that lasts for years. The hydrophobic properties ensure water beads up and rolls off, keeping your car cleaner for longer and making future care a breeze.</p>
          }
        ]}
        faqs={[
          {
            q: "Do you offer subscription-based monthly car cleaning?",
            a: "Yes! We offer discounted monthly packages that include regular scheduled care to keep your car looking pristine year-round."
          },
          {
            q: "What is included in doorstep vehicle care?",
            a: "Our doorstep vehicle care cleans dirt safely using specialized solutions."
          }
        ]}
      />
    </div>
  );
}
