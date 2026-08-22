import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getActiveSubscription, ActiveSubscription } from "../services/dbService";

import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import BookingSection from "../components/sections/BookingSection";
import JobOpportunity from "../components/sections/JobOpportunity";
import BeforeAfter from "../components/sections/BeforeAfter";
import Testimonials from "../components/sections/Testimonials";
import FAQ from "../components/sections/FAQ";
import SubscriberDashboard from "../components/sections/SubscriberDashboard";

import SEO from "../components/seo/SEO";
import SeoTextSection from "../components/seo/SeoTextSection";
import { getWebSiteSchema, getLocalBusinessSchema, getFAQSchema, getReviewSchema } from "../utils/seoSchemas";

export default function Home() {
  const { user } = useAuth();
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);

  useEffect(() => {
    if (user) {
      getActiveSubscription(user.uid).then((sub) => {
        setActiveSub(sub);
      });
    } else {
      setActiveSub(null);
    }
  }, [user]);

  const homeFaqs = [
    {
      question: "Do you offer doorstep car and bike cleaning in Kanpur?",
      answer: "Yes, VA Car & Bike Care provides 100% doorstep car washing and interior care at your home or office in Kanpur."
    },
    {
      question: "How much does a doorstep car wash cost?",
      answer: "Doorstep bike washes start at ₹100 and car services at ₹150. Monthly subscription plans offer max savings!"
    },
    {
      question: "How do monthly car cleaning subscriptions work?",
      answer: "Choose your vehicle type and schedule slot. Our technicians visit your doorstep on regular scheduled days. Pay monthly with 100% satisfaction guarantee."
    },
    {
      question: "Do you clean super-bikes and heavy motorcycles?",
      answer: "Yes, we specialize in superbike care, chain lube, and ceramic polish."
    }
  ];

  const homeReviews = [
    { author: "Aman Gupta", rating: 5, review: "Best doorstep car wash in Kanpur! Technician arrived on time and cleaned my SUV brilliantly.", date: "2026-07-28" },
    { author: "Rohan Verma", rating: 5, review: "Super bike care for my Royal Enfield. Very affordable and professional.", date: "2026-08-01" },
    { author: "Sneha Sharma", rating: 5, review: "Subscribed to monthly car wash plan. Zero hassle and shiny car every morning!", date: "2026-08-03" }
  ];

  return (
    <div className="w-full bg-[#070C16]">
      <SEO 
        title="VA Car & Bike Care | Premium Doorstep Car Cleaning Service"
        description="VA Car & Bike Care delivers top-rated doorstep car cleaning & monthly subscription plans in Kanpur. Zero advance needed!"
        keywords="VA Car Care, doorstep car wash kanpur, bike cleaning kanpur, monthly car wash subscription, ceramic coating"
        schemas={[
          getWebSiteSchema(),
          getLocalBusinessSchema(),
          getFAQSchema(homeFaqs),
          getReviewSchema(homeReviews)
        ]}
      />
      
      {activeSub ? (
        <SubscriberDashboard subscription={activeSub} />
      ) : (
        <Hero />
      )}
      
      {/* 2. Premium Services Cards */}
      <Services />
      
      {/* 3. Why Choose Us Advantages */}
      <WhyChooseUs />

      {/* 4. Inline Doorstep Booking Form */}
      {!activeSub && <BookingSection />}
      
      {/* 5. Achievements & Job checklist splits */}
      <JobOpportunity />

      {/* 6. Interactive Before & After Slider */}
      <BeforeAfter />

      {/* 7. Animated Testimonials Quote Slider */}
      <Testimonials />
      
      {/* 8. Frequently Asked Questions */}
      <FAQ />

      {/* Comprehensive SEO Content Section for Topical Authority */}
      <SeoTextSection 
        heading="The Best Doorstep Car Care in Kanpur"
        contentBlocks={[
          {
            title: "Professional Mobile Car Care Delivered to You",
            body: <p>At VA Car &amp; Bike Care, we understand that your time is valuable. That's why we bring our premium <strong>doorstep car washing services</strong> directly to your home, office, or apartment complex in Kanpur. We use industry-leading eco-friendly chemicals, ultra-soft microfiber cloths, and minimal water technology to ensure a scratch-free finish for your vehicle without the hassle of waiting at a traditional service center.</p>
          },
          {
            title: "Advanced Car Care Technologies",
            body: <p>We don't just wash cars; we rejuvenate them. Our expert technicians are equipped with advanced tools ranging from high-pressure lances to industrial-grade extractors for interior fabric care. Whether you need a quick maintenance wash or a multi-year 9H Ceramic Coating application, we guarantee the highest standards of automotive care.</p>
          }
        ]}
        faqs={homeFaqs.map(f => ({ q: f.question, a: f.answer }))}
      />
    </div>
  );
}
