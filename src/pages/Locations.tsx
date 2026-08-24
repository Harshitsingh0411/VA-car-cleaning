<<<<<<< HEAD
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { seoLocations } from '../data/seoData';
import SEO from '../components/seo/SEO';
import { MapPin, Search, ShieldCheck, Sparkles, ArrowRight, Phone, Calendar, CheckCircle2 } from 'lucide-react';
import { BASE_URL } from '../utils/seoSchemas';

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLocations = seoLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const locationDirectorySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "VA Car Care Service Locations in Kanpur",
    "description": "Doorstep car wash and bike detailing available in all major localities across Kanpur.",
    "itemListElement": seoLocations.map((loc, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": `Car Wash & Detailing in ${loc.name}, Kanpur`,
      "url": `${BASE_URL}/kanpur/${loc.slug}`
    }))
  };

  return (
    <>
      <SEO
        title="Doorstep Car & Bike Cleaning Locations in Kanpur | VA Car Care"
        description="We offer 100% doorstep car washing, interior detailing, and bike cleaning across all 29+ major areas in Kanpur including Kakadeo, Kidwai Nagar, Swaroop Nagar, Kalyanpur, Barra, Civil Lines, and more."
        keywords="car wash kanpur locations, doorstep car care kakadeo, car detailing kidwai nagar, swaroop nagar car wash, kalyanpur car care"
        canonicalUrl={`${BASE_URL}/locations`}
        schemas={[locationDirectorySchema]}
      />

      {/* Hero Header */}
      <section className="pt-32 pb-16 bg-[#070C16] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[#070C16] to-[#0B1220] z-0" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[#F4B400] text-xs font-extrabold tracking-widest uppercase mb-6 backdrop-blur-md">
            <MapPin size={14} className="animate-bounce text-[#F4B400]" /> 29+ Kanpur Localities Covered
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight mb-6">
            Doorstep Car &amp; Bike Care in <span className="text-[#F4B400]">Every Corner of Kanpur</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Select your neighborhood below to get instant doorstep auto cleaning, foam washing, interior steam detailing, and ceramic coating right at your home.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search your locality (e.g. Kakadeo, Swaroop Nagar, Kalyanpur...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4B400] backdrop-blur-md transition-all text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-20 bg-gray-50 min-h-[500px]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-dark">
                Explore All Service Areas
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing {filteredLocations.length} active service locations in Kanpur
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Zero Advance Payment &bull; Doorstep Delivery</span>
            </div>
          </div>

          {filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredLocations.map((loc) => (
                <Link
                  key={loc.slug}
                  to={`/kanpur/${loc.slug}`}
                  className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <MapPin size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Doorstep
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-dark text-base group-hover:text-primary transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Doorstep car wash &amp; detailing service in {loc.name}.
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>View Location Page</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 max-w-md mx-auto p-8">
              <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-dark mb-1">No Locality Found</h3>
              <p className="text-xs text-gray-500 mb-4">
                We service ALL areas of Kanpur! Even if your locality isn't listed in search, we come directly to your home.
              </p>
              <Link to="/book" className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl">
                Book Any Location in Kanpur
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Across Kanpur */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-dark">Fast Home Dispatch</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Equipped detailing vans arrive directly at your residence anywhere in Kanpur.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-dark">Professional Grade Tools</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                High pressure snow foam, microfiber drying, interior steam vacuum &amp; liquid wax finish.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-dark">Pay After Satisfaction</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Zero advance booking fees. Pay via UPI or Cash only after inspecting your shiny vehicle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-heading font-extrabold mb-3">
            Need Doorstep Car Care in Your Area Today?
          </h2>
          <p className="text-gray-200 text-sm max-w-xl mx-auto mb-6">
            Book online in under 60 seconds or speak directly with our Kanpur booking helpline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/book"
              className="bg-[#F4B400] text-dark font-extrabold py-3.5 px-8 rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-yellow-500/20"
            >
              <Calendar size={18} /> Book Online Now
            </Link>
            <a
              href="tel:+919569949626"
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-8 rounded-2xl border border-white/20 flex items-center gap-2 transition-all"
            >
              <Phone size={18} /> Call Helpline
            </a>
          </div>
        </div>
      </section>
    </>
=======
import React, { useState } from "react";
import { motion } from "motion/react";
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
>>>>>>> 7e29a6d (location chnage)
  );
}
