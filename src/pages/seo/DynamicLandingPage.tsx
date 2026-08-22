import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { seoLocations, seoServices } from '../../data/seoData';
import SEO from '../../components/seo/SEO';
import { CheckCircle2, Star, MapPin, Calendar, ArrowRight, ShieldCheck, FileText, User, Sparkles } from 'lucide-react';
import { getAllReviews, dbReview, getAllServices, getAllServicesSync, dbService, subscribeToDataChanges } from '../../services/dbService';
import { useImageLightbox } from '../../context/ImageLightboxContext';
import { isLocalBlobUrl } from '../../utils/mediaUtils';

interface DynamicLandingProps {
  type?: 'service' | 'location' | 'combined';
}

export default function DynamicLandingPage({ type }: DynamicLandingProps) {
  const { openLightbox } = useImageLightbox();
  const { slug, serviceSlug, locationSlug } = useParams<{ slug?: string, serviceSlug?: string, locationSlug?: string }>();
  const [reviews, setReviews] = useState<dbReview[]>([]);
  const [dbServicesList, setDbServicesList] = useState<dbService[]>(() => getAllServicesSync());
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const fetchDbServices = () => {
    getAllServices().then((loaded) => {
      setDbServicesList(loaded);
    }).catch(err => {
      console.error("Failed to load db services in DynamicLandingPage:", err);
    });
  };

  useEffect(() => {
    fetchDbServices();
    const unsubscribe = subscribeToDataChanges((topic) => {
      if (!topic || topic === "all" || topic === "services" || topic === "pricing") {
        fetchDbServices();
      }
    });
    return () => unsubscribe();
  }, []);

  const normalizeSlug = (str?: string) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Dynamic database services
  const combinedServiceList = dbServicesList.map(ds => ({
    id: ds.id,
    name: ds.name,
    slug: ds.id || ds.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: ds.description || `Professional doorstep ${ds.name} for your vehicle in Kanpur.`,
    price: String(ds.price),
    image: ds.image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800",
    features: [
      "100% Doorstep Service at your location",
      "Trained professional detailing technician",
      "High-pressure foam & eco-friendly products",
      "Pay on delivery — zero upfront payment needed"
    ]
  }));

  // Parse slug like "foam-car-wash-kanpur" or "ceramic-coating-kakadeo"
  let matchedService: any = null;
  let matchedLocation: any = null;

  const targetServiceKey = serviceSlug || slug;
  const normTargetKey = normalizeSlug(targetServiceKey);

  const defaultCityLoc = { name: "Kanpur", slug: "kanpur", type: "city" };

  if ((type === 'service' || !type) && targetServiceKey && targetServiceKey !== locationSlug) {
    matchedService = combinedServiceList.find(s => normalizeSlug(s.slug) === normTargetKey || normalizeSlug(s.id) === normTargetKey || normalizeSlug(s.name) === normTargetKey);
    matchedLocation = defaultCityLoc; // Default city context
  } else if (type === 'location' && locationSlug) {
    const normLoc = normalizeSlug(locationSlug);
    matchedLocation = seoLocations.find(l => normalizeSlug(l.slug) === normLoc) || { name: locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), slug: locationSlug, type: "locality" };
    if (selectedServiceId) {
      matchedService = combinedServiceList.find(s => s.id === selectedServiceId || normalizeSlug(s.slug) === normalizeSlug(selectedServiceId)) || null;
    } else {
      matchedService = null;
    }
  } else if (type === 'combined' && serviceSlug && locationSlug) {
    const normLoc = normalizeSlug(locationSlug);
    matchedService = combinedServiceList.find(s => normalizeSlug(s.slug) === normTargetKey || normalizeSlug(s.id) === normTargetKey || normalizeSlug(s.name) === normTargetKey);
    matchedLocation = seoLocations.find(l => normalizeSlug(l.slug) === normLoc) || { name: locationSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), slug: locationSlug, type: "locality" };
  } else if (slug) {
    const normLoc = normalizeSlug(slug);
    const locMatch = seoLocations.find(l => normalizeSlug(l.slug) === normLoc);
    if (locMatch) {
      matchedLocation = locMatch;
      if (selectedServiceId) {
        matchedService = combinedServiceList.find(s => s.id === selectedServiceId || normalizeSlug(s.slug) === normalizeSlug(selectedServiceId)) || null;
      } else {
        matchedService = null;
      }
    } else {
      for (const serviceItem of combinedServiceList) {
        if (normTargetKey.startsWith(normalizeSlug(serviceItem.slug))) {
          matchedService = serviceItem;
          const locationPart = slug.replace(`${serviceItem.slug}-`, '');
          matchedLocation = seoLocations.find(l => normalizeSlug(l.slug) === normalizeSlug(locationPart));
          break;
        }
      }
    }
  }

  const location = matchedLocation || defaultCityLoc;
  const isLocationOnlyPage = (type === 'location' || (!matchedService && !serviceSlug));

  const foundInDb = dbServicesList.find(ds => normalizeSlug(ds.id) === normTargetKey || normalizeSlug(ds.name) === normTargetKey);

  const service = matchedService || {
    id: "",
    name: "Doorstep Vehicle Care",
    slug: "",
    description: `We bring the highest quality auto care directly to your doorstep in ${location.name}.`,
    price: "",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800",
    features: [
      "100% Doorstep Service at your location",
      "Trained professional technician",
      "Pay on delivery — zero advance needed"
    ]
  };

  useEffect(() => {
    getAllReviews().then(all => {
      const filtered = isLocationOnlyPage
        ? all
        : all.filter(r => r.serviceName === service.name || r.serviceName?.toLowerCase().includes(service.name.toLowerCase()));
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReviews(filtered);
    }).catch(console.error);
  }, [service.name, isLocationOnlyPage]);

  const getTerms = (slug: string) => {
    if (slug.includes('subscription')) {
      return ["Valid for 30 days from 1st wash", "Up to 4 washes per month", "Non-transferable"];
    }
    return ["Doorstep service included", "Pay after service completion", "100% satisfaction guaranteed"];
  };
  const currentTerms = getTerms(service.slug);

  const pageTitle = isLocationOnlyPage
    ? `Doorstep Car & Bike Cleaning in ${location.name} | VA Car Care`
    : `${service.name} in ${location.name} | Professional Doorstep Service`;

  const pageDescription = isLocationOnlyPage
    ? `Professional doorstep car wash and motorcycle cleaning services in ${location.name}. Right at your home.`
    : `Looking for ${service.name.toLowerCase()} in ${location.name}? VaCar Cleaning Service offers premium, eco-friendly doorstep care${service.price ? ` at just ₹${service.price}` : ""}. Book online today!`;

  const faqData = [
    {
      question: `Do you provide car & bike cleaning at home in ${location.name}?`,
      answer: `Yes, we provide 100% doorstep car washing and bike care services anywhere in ${location.name}. Our professional crew comes fully equipped with water, power tools, and premium cleaning agents.`
    },
    {
      question: `How much does doorstep care cost in ${location.name}?`,
      answer: `Our professional care packages in ${location.name} offer transparent, budget-friendly rates with no hidden charges. You pay after service completion.`
    },
    {
      question: `How long does the service take?`,
      answer: `Depending on the vehicle size and package selected, our doorstep service usually takes between 45 minutes to 2 hours to ensure a showroom-like finish.`
    }
  ];

  // Dynamic Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": pageTitle,
    "provider": {
      "@type": "LocalBusiness",
      "name": "VaCar Cleaning Service",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location.name,
        "addressRegion": "Uttar Pradesh",
        "addressCountry": "IN"
      }
    },
    "description": pageDescription,
    "areaServed": {
      "@type": "Place",
      "name": location.name
    }
  };

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${location.name} car wash, car cleaning ${location.name}, doorstep detailing ${location.name}`}
        canonicalUrl={`https://vacarcleaningservice.com/${type === 'service' ? 'services/' + service.slug : type === 'location' ? 'kanpur/' + location.slug : 'services/' + service.slug + '/kanpur/' + location.slug}`}
        schemas={[schema]}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-[#070C16] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[#070C16] z-0" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F4B400] text-xs font-bold tracking-widest uppercase">
              <MapPin size={14} /> Available in {location.name}
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight">
              {matchedService ? (
                <>Premium <span className="text-[#F4B400]">{matchedService.name}</span> in {location.name}</>
              ) : (
                <>Doorstep <span className="text-[#F4B400]">Car & Bike Cleaning</span> in {location.name}</>
              )}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {matchedService ? matchedService.description : service.description}
            </p>

            {/* Service Option Selector for Location Pages (Only when no service is selected) */}
            {!matchedService && (
              <div className="pt-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#F4B400] block mb-1.5">
                  Select Service Package for {location.name}:
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full max-w-md bg-[#0B1220] border border-white/20 rounded-2xl py-3.5 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#F4B400] cursor-pointer appearance-none"
                >
                  <option value="">All Services (Explore All Packages)</option>
                  {combinedServiceList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.price ? `(₹${s.price})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to={matchedService ? `/book?service=${matchedService.id || matchedService.slug}` : "/book"}
                className="bg-[#F4B400] hover:bg-yellow-500 text-dark font-extrabold py-4 px-8 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-yellow-500/20"
              >
                <Calendar size={20} />
                {matchedService
                  ? `Book ${matchedService.name}${matchedService.price ? ` - ₹${matchedService.price}` : ""}`
                  : `Book Service in ${location.name}`}
              </Link>
              <a href="tel:+918090757262" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold py-4 px-8 rounded-2xl flex items-center gap-2 transition-all">
                Call Expert
              </a>
            </div>

            <div className="flex items-center gap-4 pt-6 text-xs text-gray-400 font-semibold">
              <div className="flex items-center gap-1.5"><Star size={16} className="fill-[#F4B400] text-[#F4B400]" /> 4.9/5 Rating</div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Verified Experts</div>
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-400" /> Doorstep Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Detailing Services Grid on Location Page */}
      {isLocationOnlyPage && combinedServiceList.length > 0 && (
        <section className="py-16 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-primary font-heading font-semibold tracking-widest text-xs uppercase block mb-1">
                — DETAILED PACKAGES —
              </span>
              <h2 className="text-3xl font-heading font-extrabold text-dark">
                Available Detailing Services in {location.name}
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Select any package below to view details or book professional doorstep detailing in {location.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {combinedServiceList.map((srv) => (
                <div
                  key={srv.id}
                  className={`bg-white rounded-3xl p-6 shadow-md border transition-all flex flex-col justify-between hover:shadow-xl ${
                    selectedServiceId === srv.id ? "border-2 border-primary ring-2 ring-primary/20" : "border-gray-100"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-heading font-extrabold text-lg text-dark">{srv.name}</h3>
                      <span className="text-primary font-black text-lg bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        ₹{srv.price}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{srv.description}</p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      {selectedServiceId === srv.id ? "✓ Selected" : "Select Package"}
                    </button>
                    <Link
                      to={`/book?service=${srv.id}`}
                      className="flex-1 bg-primary hover:bg-[#0b327b] text-white text-center font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      Book Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-extrabold text-dark">
                Why Choose Our {service.name} in {location.name}?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Residents of {location.name} trust VaCar Cleaning Service for reliable, high-quality, and eco-friendly {service.name.toLowerCase()}.
                We use premium microfibers, pH-neutral shampoos, and a safe double-bucket wash method to ensure a swirl-free finish.
              </p>

              <ul className="space-y-4 pt-4">
                {[
                  "100% Doorstep Convenience",
                  "Eco-friendly & Water-saving Techniques",
                  "Professionally Trained & Background Verified Crew",
                  "Transparent Pricing & Secure Online Payments"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-dark">
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/services" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mt-4">
                Explore all our services <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-xl border border-gray-100 relative group">
                <img
                  src={(service as any).image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"}
                  alt={`${service.name} in ${location.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-dark text-lg">Serving {location.name}</h4>
                  <p className="text-xs text-gray-500 font-semibold">Fast dispatch within 60 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section for Semantic SEO */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-extrabold text-dark">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-2">
              Everything you need to know about {service.name.toLowerCase()} in {location.name}.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-dark mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Terms & Conditions Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-dark">
                Terms & Conditions
              </h2>
              <p className="text-gray-500 text-sm">Please read the operational rules for {service.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <ul className="space-y-3">
              {currentTerms.map((term, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                  <span className="text-primary mt-1 shrink-0"><CheckCircle2 size={16} /></span>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-extrabold text-dark">
              Customer Reviews
            </h2>
            <p className="text-gray-500 mt-2">
              See what our customers are saying about {service.name} in {location.name}
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                          {review.customerName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-dark text-sm">{review.customerName}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{review.serviceDate || new Date(review.createdAt || '').toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.stars ? "fill-[#F4B400] text-[#F4B400]" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic mb-3">"{review.review}"</p>

                    {/* Customer attached review images & videos */}
                    {(review.images?.length || review.videos?.length) ? (
                      <div className="flex gap-2 pt-2 overflow-x-auto border-t border-gray-50 mt-2">
                        {review.images?.map((imgUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openLightbox({ url: imgUrl, type: "image", title: `Review Photo by ${review.customerName}` })}
                            className="shrink-0 cursor-pointer group relative overflow-hidden rounded-xl border border-gray-200"
                          >
                            <img src={imgUrl} alt={`Photo by ${review.customerName}`} className="w-14 h-14 object-cover group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                              View
                            </div>
                          </button>
                        ))}
                        {review.videos?.map((vidUrl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openLightbox({ url: vidUrl, type: "video", title: `Review Video by ${review.customerName}` })}
                            className="shrink-0 cursor-pointer group relative overflow-hidden rounded-xl border border-gray-200 bg-black"
                          >
                            {!isLocalBlobUrl(vidUrl) ? (
                              <video src={vidUrl} className="w-20 h-14 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <div className="w-20 h-14 bg-gray-900 flex items-center justify-center text-amber-400 text-[8px] font-bold p-1 text-center">
                                Local Clip
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shadow-sm">
                                ▶
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">No reviews yet!</h3>
              <p className="text-gray-500 text-sm">Be the first to experience and review our {service.name}.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-heading font-extrabold mb-4">Ready to revitalize your vehicle in {location.name}?</h2>
          <Link to={`/book?service=${service.slug || service.id}`} className="inline-block bg-[#F4B400] text-dark font-extrabold py-4 px-10 rounded-full mt-4 hover:scale-105 transition-transform shadow-xl shadow-yellow-500/20">
            Book {service.name} Now
          </Link>
        </div>
      </section>
    </>
  );
}
