import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, ArrowRight, Sparkles, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { seoLocations } from "../data/seoData";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import BookingSection from "../components/sections/BookingSection";
import SeoTextSection from "../components/seo/SeoTextSection";
import { getBreadcrumbSchema } from "../utils/seoSchemas";

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = seoLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const breadcrumbs = [{ name: "Locations", path: "/locations" }];
  const schemas = [getBreadcrumbSchema(breadcrumbs)];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-16">
      <SEO
        title="Doorstep Car & Bike Cleaning Service Locations in Kanpur | VA Car Care"
        description="Find doorstep car wash, bike cleaning, and vehicle detailing services across Kanpur. Serving Indira Nagar, Kakadeo, Swaroop Nagar, Civil Lines, Tilak Nagar, and all key localities."
        keywords="car wash kanpur locations, doorstep bike cleaning indira nagar, car detailing swaroop nagar, auto cleaning civil lines kanpur"
        schemas={schemas}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 mb-10 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
            <MapPin size={14} /> Doorstep Service Across Kanpur
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">
            Our Service <span className="text-primary">Locations</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            We deliver professional doorstep water-efficient car washing, foam cleaning, and bike detailing straight to your home or workplace across Kanpur.
          </p>

          {/* Search Box */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your Kanpur locality or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="container mx-auto px-4 md:px-6 mb-16">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-100 max-w-md mx-auto">
            <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-dark mb-1">No Locality Found</h3>
            <p className="text-gray-500 text-xs mb-4">
              We service all areas in Kanpur. Contact our team to book doorstep detailing at your address.
            </p>
            <Link
              to="/book"
              className="inline-block bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs hover:bg-[#0b327b] transition-colors"
            >
              Book Custom Location
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredLocations.map((location, index) => (
              <motion.div
                key={location.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <MapPin size={20} />
                    </div>
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-wider">
                      DOORSTEP
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-extrabold text-dark group-hover:text-primary transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    Doorstep car wash &amp; detailing service in {location.name}.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-gray-50">
                  <Link
                    to={`/kanpur/${location.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                  >
                    View Location Page
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 md:px-6 mb-16">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-dark">100% Doorstep Service</h4>
              <p className="text-gray-500 text-xs mt-1">
                Our technicians arrive fully equipped at your apartment, home, or office parking.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-dark">Fast Dispatch in Kanpur</h4>
              <p className="text-gray-500 text-xs mt-1">
                Flexible appointment slots from 8:00 AM to 7:00 PM across all service zones.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-dark">Scratch-Free Detailing</h4>
              <p className="text-gray-500 text-xs mt-1">
                High-pressure snow foam and plush microfibers guarantee pristine showroom gloss.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BookingSection />

      <SeoTextSection
        heading="Doorstep Car Washing & Detailing Network in Kanpur"
        contentBlocks={[
          {
            title: "Serving Every Corner of Kanpur",
            body: (
              <p>
                VA Car &amp; Bike Care operates across Kanpur, including key residential and commercial hubs such as Indira Nagar, Kakadeo, Swaroop Nagar, Civil Lines, Kalyanpur, Shyam Nagar, and Tilak Nagar. No matter where you are located, our mobile detailing team reaches your doorstep on time.
              </p>
            )
          },
          {
            title: "Eco-Friendly Technology & Zero Hassle",
            body: (
              <p>
                Forget spending hours waiting at crowded service stations. Our trained detailers bring high-pressure washers, eco-friendly foam shampoos, and professional vacuum extractors directly to your premises.
              </p>
            )
          }
        ]}
        faqs={[
          {
            q: "Is doorstep detailing available in all Kanpur locations?",
            a: "Yes! We serve all major residential colonies, townships, and commercial areas across Kanpur city."
          },
          {
            q: "Do I need to supply water or electricity?",
            a: "Our crew comes with standard connection extensions. Access to a standard water tap and electrical point ensures the best service."
          }
        ]}
      />
    </div>
  );
}
