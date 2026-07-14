import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import BookingSection from "../components/sections/BookingSection";
import JobOpportunity from "../components/sections/JobOpportunity";
import BeforeAfter from "../components/sections/BeforeAfter";
import Testimonials from "../components/sections/Testimonials";
import FAQ from "../components/sections/FAQ";

export default function Home() {
  return (
    <div className="w-full bg-[#070C16]">
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
    </div>
  );
}
