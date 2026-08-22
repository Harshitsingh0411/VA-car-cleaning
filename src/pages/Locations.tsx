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
  );
}
