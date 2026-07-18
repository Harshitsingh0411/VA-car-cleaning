import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import BookingSection from "../components/sections/BookingSection";
import JobOpportunity from "../components/sections/JobOpportunity";
import BeforeAfter from "../components/sections/BeforeAfter";
import Testimonials from "../components/sections/Testimonials";
import FAQ from "../components/sections/FAQ";

import SEO from "../components/seo/SEO";
import SeoTextSection from "../components/seo/SeoTextSection";

export default function Home() {
  return (
    <div className="w-full bg-[#070C16]">
      <SEO 
        title="VaCar - Best Doorstep Car Cleaning & Detailing in Kanpur"
        description="VaCar Cleaning Service offers premium foam wash, ceramic coating, and interior dry cleaning at your doorstep in Kanpur. Top-rated professional detailing."
      />
      {/* 1. Dark Hero Section */}
      <Hero />
      
      {/* 2. Premium Services Cards */}
      <Services />
      
      {/* 3. Why Choose Us Advantages */}
      <WhyChooseUs />

      {/* 4. Inline Doorstep Booking Form */}
      <BookingSection />
      
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
        heading="The Best Doorstep Car Wash & Detailing in Kanpur"
        contentBlocks={[
          {
            title: "Professional Mobile Detailing Delivered to You",
            body: <p>At VaCar Cleaning Service, we understand that your time is valuable. That's why we bring our premium <strong>doorstep car washing and detailing services</strong> directly to your home, office, or apartment complex in Kanpur. We use industry-leading eco-friendly chemicals, ultra-soft microfiber cloths, and minimal water technology to ensure a scratch-free, mirror-like finish for your vehicle without the hassle of waiting at a traditional service center.</p>
          },
          {
            title: "Advanced Car Care Technologies",
            body: <p>We don't just wash cars; we rejuvenate them. Our expert technicians are equipped with advanced tools ranging from high-pressure foam lances for exterior snow washes to industrial-grade vacuum extractors for deep interior fabric cleaning. Whether you need a quick maintenance wash, a deep dashboard polish, or a multi-year 9H Ceramic Coating application, we guarantee the highest standards of automotive care.</p>
          }
        ]}
        faqs={[
          {
            q: "Do I need to provide water and electricity for the service?",
            a: "For exterior foam washes, we require access to a standard water tap. For interior deep cleaning (vacuuming), we require a standard 5A/15A power socket within 25 meters of the vehicle."
          },
          {
            q: "Is doorstep car washing safe for my paint?",
            a: "Absolutely! We use a strict two-bucket wash method with grit guards, pH-neutral shampoos, and premium microfiber towels to ensure zero swirl marks or scratches."
          },
          {
            q: "How long does a typical interior deep cleaning take?",
            a: "A comprehensive interior detailing session usually takes between 60 to 90 minutes depending on the vehicle's size and condition."
          },
          {
            q: "Which areas in Kanpur do you serve?",
            a: "We cover almost all major localities in Kanpur including Kakadeo, Swaroop Nagar, Kidwai Nagar, Civil Lines, Kalyanpur, and more."
          }
        ]}
      />
    </div>
  );
}
