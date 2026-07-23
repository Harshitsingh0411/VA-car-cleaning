import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { seoLocations, seoServices } from '../../data/seoData';
import SEO from '../../components/seo/SEO';
import { CheckCircle2, Star, MapPin, Calendar, ArrowRight, ShieldCheck, FileText, User } from 'lucide-react';
import { getAllReviews, dbReview } from '../../services/dbService';

interface DynamicLandingProps {
  type: 'service' | 'location' | 'combined';
}

export default function DynamicLandingPage({ type }: DynamicLandingProps) {
  const { slug, serviceSlug, locationSlug } = useParams<{ slug?: string, serviceSlug?: string, locationSlug?: string }>();
  const [reviews, setReviews] = useState<dbReview[]>([]);

  // Parse slug like "foam-car-wash-kanpur" or "ceramic-coating-kakadeo"
  // We need to find which service and location it matches.
  let matchedService = null;
  let matchedLocation = null;

  if (type === 'service' && serviceSlug) {
    matchedService = seoServices.find(s => s.slug === serviceSlug);
    matchedLocation = seoLocations[0]; // Default to Kanpur
  } else if (type === 'location' && locationSlug) {
    matchedLocation = seoLocations.find(l => l.slug === locationSlug);
    matchedService = seoServices[0]; // Default to Doorstep Cleaning
  } else if (type === 'combined' && serviceSlug && locationSlug) {
    matchedService = seoServices.find(s => s.slug === serviceSlug);
    matchedLocation = seoLocations.find(l => l.slug === locationSlug);
  } else if (slug) {
    for (const service of seoServices) {
      if (slug.startsWith(service.slug)) {
        matchedService = service;
        const locationPart = slug.replace(`${service.slug}-`, '');
        matchedLocation = seoLocations.find(l => l.slug === locationPart);
        break;
      }
    }
  }

  // Fallback to generic if not matched properly
  const service = matchedService || seoServices[0];
  const location = matchedLocation || seoLocations[0];

  useEffect(() => {
    getAllReviews().then(all => {
      const filtered = all.filter(r => r.serviceName === service.name);
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReviews(filtered);
    }).catch(console.error);
  }, [service.name]);

  const getTerms = (slug: string) => {
    if (slug.includes('subscription')) {
      return [
        "1. Minimum Subscription Period: 1 Month.",
        "2. Payment is required upfront via Pay on Delivery for the first visit.",
        "3. Includes one full exterior foam wash per week and daily dry cloth wipe-down.",
        "4. Non-refundable once the first wash is completed.",
        "5. Customer must provide a safe parking space and remove valuables from the vehicle."
      ];
    } else {
      return [
        "1. Pay on Delivery: Pay only after you are 100% satisfied.",
        "2. Service duration may vary depending on vehicle condition.",
        "3. Customer must provide access to vehicle keys for interior cleaning.",
        "4. Remove all valuables before handover; we are not responsible for lost items.",
        "5. Booking cancellation is free up to 2 hours before the scheduled time."
      ];
    }
  };
  const currentTerms = getTerms(service.slug);

  const pageTitle = `${service.name} in ${location.name} | Professional Doorstep Service`;
  const pageDescription = `Looking for ${service.name.toLowerCase()} in ${location.name}? VaCar Cleaning Service offers premium, eco-friendly doorstep detailing at just ₹${service.price}. Book online today!`;

  const faqData = [
    {
      question: `Do you provide ${service.name.toLowerCase()} at home in ${location.name}?`,
      answer: `Yes, we provide 100% doorstep ${service.name.toLowerCase()} services anywhere in ${location.name}. Our professional crew comes fully equipped with water,  and premium   cleaning agents.`
    },
    {
      question: `How much does ${service.name.toLowerCase()} cost in ${location.name}?`,
      answer: `Our professional ${service.name.toLowerCase()} packages in ${location.name} start at just ₹${service.price}. We offer transparent pricing with no hidden charges.`
    },
    {
      question: `How long does the service take?`,
      answer: `Depending on the vehicle size and condition, our ${service.name.toLowerCase()} usually takes between 45 minutes to 2 hours to ensure a showroom-like finish.`
    }
  ];

  // Dynamic Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${service.name} in ${location.name}`,
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
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "INR"
    },
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
        keywords={`${service.name.toLowerCase()}, ${location.name} car wash, car cleaning ${location.name}, doorstep detailing ${location.name}`}
        canonicalUrl={`https://vacarcleaningservice.com/${type === 'service' ? 'services/' + service.slug : type === 'location' ? 'kanpur/' + location.slug : 'services/' + service.slug + '/kanpur/' + location.slug}`}
        schema={schema}
        location={location.name}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-[#070C16] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-[#070C16] z-0" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#F4B400] text-xs font-bold tracking-widest uppercase">
              <MapPin size={14} /> Available in {location.name}, Kanpur
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight">
              Premium <span className="text-[#F4B400]">{service.name}</span> in {location.name}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {service.description} We bring the highest quality auto detailing directly to your doorstep in {location.name}.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/book" className="bg-[#F4B400] hover:bg-yellow-500 text-dark font-extrabold py-4 px-8 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-yellow-500/20">
                <Calendar size={20} />
                Book Now - ₹{service.price}
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
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold uppercase">
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
                    <p className="text-gray-600 text-sm leading-relaxed italic">"{review.review}"</p>
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
          <Link to="/book" className="inline-block bg-[#F4B400] text-dark font-extrabold py-4 px-10 rounded-full mt-4 hover:scale-105 transition-transform shadow-xl shadow-yellow-500/20">
            Book {service.name} Now
          </Link>
        </div>
      </section>
    </>
  );
}
