import { motion } from "motion/react";
import { Droplets, Sparkles, Wind, ShieldCheck, Settings, Car, Flame, CheckCircle, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import BookingSection from "../components/sections/BookingSection";
import SEO from "../components/seo/SEO";
import SeoTextSection from "../components/seo/SeoTextSection";

const detailedServices = [
  {
    title: "Exterior Wash",
    description: "Our signature exterior clean removing grit, dirt, and atmospheric film. We use high-lubricity foam and scratch-free microfiber mitts.",
    benefits: ["Scratch-free hand wash", "Wheel & wheel well blast", "Streak-free glass clean", "Hand towel dry"],
    icon: <Droplets size={36} />,
    price: "₹499",
    duration: "45 Mins",
    image: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Interior Cleaning",
    description: "A comprehensive cabin rejuvenation. We deep vacuum all carpet and fabric surfaces, disinfect contact points, and restore matte finishes.",
    benefits: ["Complete carpets & mats vacuumed", "Upholstery spot-cleaned", "Disinfection of console & doors", "Odor neutralizer treatment"],
    icon: <Sparkles size={36} />,
    price: "₹799",
    duration: "60 Mins",
    image: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Premium Detailing",
    description: "The ultimate bumper-to-bumper detailing package. Restores exterior paint clarity and brings interior surfaces to showroom quality.",
    benefits: ["3-step paint decontamination", "Ultra-soft premium paste wax", "Engine bay detail & dress", "Leather conditioning treatment"],
    icon: <ShieldCheck size={36} />,
    price: "₹1999",
    duration: "120 Mins",
    image: "https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Ceramic Coating",
    description: "Apply a premium nano-crystalline ceramic layer. Protects against UV rays, acid rain, road salt, and harsh bird droppings for up to 2 years.",
    benefits: ["9H hardness coating application", "Intense hydrophobic effect", "Enhanced glossy mirror look", "2 years warranty certificate"],
    icon: <Flame size={36} />,
    price: "₹4999",
    duration: "4 Hours",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Engine Cleaning",
    description: "Remove accumulated grease, grime, and dust from the engine bay safely using high-pressure steam and specialized degreasers.",
    benefits: ["Steam cleaning of engine bay", "Degrease all rubber & metal components", "Satin-finish protective dress", "Improves heat dissipation"],
    icon: <Settings size={36} />,
    price: "₹699",
    duration: "40 Mins",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Glass Detailing",
    description: "Remove stubborn hard water stains, tree sap, and light scratches from your windshield and side windows for pristine clarity.",
    benefits: ["Glass clay bar decontamination", "Machine glass polish & buff", "Rain-repellent coat application", "Perfect night visibility"],
    icon: <Wind size={36} />,
    price: "₹399",
    duration: "30 Mins",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800"
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-light">
      <SEO 
        title="Our Services | Car Wash & Detailing in Kanpur"
        description="Explore our wide range of car cleaning services including foam wash, ceramic coating, interior detailing, and engine cleaning in Kanpur."
      />
      {/* Hero Header */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-[11px] mb-2 block"
          >
            Our Offerings
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold max-w-3xl mx-auto leading-[1.1] tracking-tight mb-3"
          >
            Professional Detailing Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Explore our comprehensive list of specialized car cleaning, restoration, and long-term protection services.
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="space-y-16">
          {detailedServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col lg:flex-row gap-12 items-center bg-white p-6 md:p-10 rounded-[32px] shadow-xl ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Service Image */}
              <div className="w-full lg:w-1/2 h-[350px] rounded-2xl overflow-hidden relative shadow-lg group">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                <div className="absolute top-6 left-6 bg-primary text-white p-4 rounded-2xl shadow-xl">
                  {service.icon}
                </div>
              </div>

              {/* Service Details */}
              <div className="w-full lg:w-1/2">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-3xl font-heading font-extrabold text-dark">
                    {service.title}
                  </h2>
                  <span className="text-2xl font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                    {service.price}
                  </span>
                </div>

                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Benefits Checklists */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-gray-400 mb-4">
                    What is included
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2.5">
                        <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration & Call to Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <span className="text-xs uppercase tracking-wider text-gray-400">Duration:</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm text-dark font-semibold">
                      {service.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <Link to={`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`} className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-dark font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-gray-200">
                        Details & Terms →
                      </button>
                    </Link>
                    <Link to="/book" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto">Book This Service</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BookingSection />

      <SeoTextSection 
        heading="Comprehensive Car Detailing Services in Kanpur"
        contentBlocks={[
          {
            title: "Why Choose Our Professional Car Cleaning Services?",
            body: <p>Our doorstep car detailing services are designed to restore your vehicle to its showroom condition. From basic exterior foam washes that strip away road grime to intensive interior dry cleaning that eliminates bacteria and odors, our certified detailers handle it all. We use state-of-the-art equipment, including high-pressure washers, steam cleaners, and industrial extractors.</p>
          },
          {
            title: "Advanced 9H Ceramic Coating",
            body: <p>Protect your car's paint from UV rays, acid rain, and minor scratches with our premium 9H Ceramic Coating service. This liquid polymer chemically bonds with your vehicle's factory paint, creating a protective layer that lasts for years. The hydrophobic properties ensure water beads up and rolls off, keeping your car cleaner for longer and making future washes a breeze.</p>
          }
        ]}
        faqs={[
          {
            q: "Do you offer subscription-based monthly car cleaning?",
            a: "Yes! We offer discounted monthly packages that include weekly exterior washes and a bi-weekly interior vacuum to keep your car looking pristine year-round."
          },
          {
            q: "What is the difference between a normal wash and a foam wash?",
            a: "A normal wash usually involves applying soap with a sponge, which can trap dirt and scratch the paint. Our foam wash uses a snow foam cannon that encapsulates dirt and lifts it off the surface safely before we even touch the paint."
          }
        ]}
      />
    </div>
  );
}
