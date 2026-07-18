import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplet, Sparkles, Zap, Award, Car, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { getAllServices, dbService } from "../../services/dbService";

export default function Services() {
  const [services, setServices] = useState<dbService[]>([]);

  useEffect(() => {
    getAllServices().then(setServices).catch(console.error);
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case "exterior":
        return { icon: <Droplet size={22} className="text-white" />, bg: "bg-blue-500" };
      case "interior":
        return { icon: <Sparkles size={22} className="text-white" />, bg: "bg-amber-500" };
      case "foam":
        return { icon: <Zap size={22} className="text-white" />, bg: "bg-cyan-500" };
      case "wax":
        return { icon: <Award size={22} className="text-white" />, bg: "bg-red-500" };
      case "dashboard":
        return { icon: <Car size={22} className="text-white" />, bg: "bg-purple-500" };
      default:
        return { icon: <Sparkles size={22} className="text-white" />, bg: "bg-teal-500" };
    }
  };

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

        {/* Services Cards Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, index) => {
            const iconInfo = getIcon(service.id);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between w-full"
              >
                {/* Image with icon overlay */}
                <Link to={`/services/${service.id}`} className="relative h-44 overflow-hidden shrink-0 block">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Floating Circle Icon */}
                  <div className={`absolute -bottom-4 left-6 w-10 h-10 ${iconInfo.bg} rounded-full flex items-center justify-center border-2 border-white shadow-md z-10 group-hover:rotate-12 transition-transform`}>
                    {iconInfo.icon}
                  </div>
                </Link>

                {/* Service description details */}
                <div className="p-6 pt-8 flex-1 flex flex-col justify-between text-dark">
                  <div className="space-y-2 mb-4 text-left">
                    <Link to={`/services/${service.id}`} className="block">
                      <h3 className="text-lg font-heading font-extrabold tracking-tight group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <span className="block text-[15px] font-heading font-black text-dark">
                          ₹{service.price}
                        </span>
                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Starting From
                        </span>
                      </div>
                      <Link
                        to={`/services/${service.id}`}
                        className="text-[11px] font-bold text-primary hover:text-dark flex items-center gap-1 transition-colors bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10"
                      >
                        Details →
                      </Link>
                    </div>

                    <Link to={`/book?service=${service.id}`} className="w-full">
                      <Button className="w-full text-[10px] uppercase tracking-wider h-8.5 rounded-xl font-bold bg-[#F4B400] text-dark hover:bg-[#ffe258] border-none shadow">
                        Book Service
                      </Button>
                    </Link>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
