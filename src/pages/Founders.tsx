import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  Sparkles,
  Instagram,
  Mail,
  Award,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Quote,
  Compass,
  ArrowLeft
} from "lucide-react";
import { getFoundersSettings, dbFoundersSettings, DEFAULT_FOUNDERS_SETTINGS } from "../services/dbService";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "../utils/seoSchemas";

export default function FoundersPage() {
  const [data, setData] = useState<dbFoundersSettings>(DEFAULT_FOUNDERS_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getFoundersSettings();
        setData(res);
      } catch (err) {
        console.error("Error loading founders data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const breadcrumbs = [
    { name: "About Us", path: "/about" },
    { name: "Founders & Leadership", path: "/founders" }
  ];

  const pillars = [
    {
      icon: <Sparkles className="text-secondary" size={24} />,
      title: "Obsession with Detailing Perfection",
      desc: "Zero swirl marks, zero paint damage, and 100% gloss enhancement using high-grade compounds and plush microfiber."
    },
    {
      icon: <ShieldCheck className="text-secondary" size={24} />,
      title: "Water & Eco Conservation",
      desc: "Saving up to 150L of water per vehicle through high-tech waterless and low-moisture foam technology."
    },
    {
      icon: <HeartHandshake className="text-secondary" size={24} />,
      title: "Youth & Freelancer Empowerment",
      desc: "Creating flexible part-time earnings, technical training, and career growth for local students across Kanpur."
    },
    {
      icon: <Compass className="text-secondary" size={24} />,
      title: "Doorstep Convenience",
      desc: "Delivering professional detailing studio standards right to your home driveway, apartment parking, or office bay."
    }
  ];

  return (
    <div className="min-h-screen bg-light text-dark">
      <SEO
        title="Founders & Leadership Team | VA Car & Bike Care"
        description="Meet the founders of VA Car & Bike Care in Kanpur. Learn about their vision, story, and dedication to eco-friendly doorstep detailing."
        keywords="VA Car Care founders, Veeru, Akhlesh, Sanket, car detailing leadership Kanpur, founder details, company leadership"
        schemas={[
          getBreadcrumbSchema(breadcrumbs),
          getLocalBusinessSchema()
        ]}
      />

      {/* Header Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-14 md:pt-28 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>



          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold max-w-4xl mx-auto leading-[1.1] tracking-tight mb-4"
          >
            {data.title || "Meet the Minds Behind VA Car Care"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {data.subtitle || "Driven by a passion for vehicle care excellence, eco-conscious innovation, and empowering youth across Kanpur."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >

          </motion.div>
        </div>
      </div>

      {/* Founders Showcase Cards */}
      <div className="container mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-1">
            Executive Leadership
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark">
            Our Founders
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-2">
            The visionary leaders shaping the future of doorstep vehicle care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {data.founders.map((founder, index) => (
            <motion.div
              key={founder.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl flex flex-col group hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col h-full justify-between">
                {/* Founder Image */}
                <div className="w-full h-72 relative overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={founder.image || "/founders/founder1.png"}
                    alt={founder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.triedSwapped) {
                        img.dataset.triedSwapped = "true";
                        const currentSrc = img.src;
                        if (currentSrc.endsWith(".jpg")) {
                          img.src = currentSrc.replace(/\.jpg$/, ".png");
                          return;
                        } else if (currentSrc.endsWith(".png")) {
                          img.src = currentSrc.replace(/\.png$/, ".jpg");
                          return;
                        }
                      }
                      img.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#F4B400] bg-[#F4B400]/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#F4B400]/30 inline-block mb-1">
                      {founder.role}
                    </span>
                    <h3 className="text-xl font-extrabold font-heading text-white">{founder.name}</h3>
                  </div>
                </div>

                {/* Founder Details Content */}
                <div className="p-6 w-full flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {founder.educationOrBackground && (
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        {founder.educationOrBackground}
                      </p>
                    )}

                    {/* Badges / Tags */}
                    {founder.badges && founder.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {founder.badges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="bg-primary/5 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-primary/10"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {founder.bio}
                    </p>

                    {/* Quote Box */}
                    {founder.quote && (
                      <div className="bg-gray-50 border-l-4 border-secondary p-3.5 rounded-r-2xl relative">
                        <Quote size={20} className="text-secondary/30 absolute top-2 right-2" />
                        <p className="text-xs italic text-gray-700 font-medium leading-relaxed">
                          "{founder.quote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Social Links & Contact */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Connect
                    </span>
                    <div className="flex items-center gap-2">
                      {founder.instagram && (
                        <a
                          href={founder.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-rose-600 hover:text-white flex items-center justify-center text-gray-600 transition-colors"
                          title="Instagram Profile"
                        >
                          <Instagram size={15} />
                        </a>
                      )}
                      {founder.email && (
                        <a
                          href={`mailto:${founder.email}`}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center text-gray-600 transition-colors"
                          title="Send Email"
                        >
                          <Mail size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Origin Story Section */}
        <div className="bg-[#0B1220] rounded-[36px] p-8 md:p-14 text-white relative overflow-hidden mb-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
            <div className="lg:w-1/2 space-y-4">
              <span className="text-secondary font-bold text-xs tracking-widest uppercase block">
                Origin Story
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold leading-tight">
                {data.originHeading || "The Story of How We Started"}
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {data.originStory1}
              </p>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {data.originStory2}
              </p>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 gap-4 w-full">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2 text-center">
                <span className="text-3xl md:text-4xl font-heading font-black text-secondary block">100%</span>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Doorstep Care</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2 text-center">
                <span className="text-3xl md:text-4xl font-heading font-black text-secondary block">150L+</span>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Water Saved / Car</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2 text-center">
                <span className="text-3xl md:text-4xl font-heading font-black text-secondary block">4.9★</span>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Client Rating</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-2 text-center">
                <span className="text-3xl md:text-4xl font-heading font-black text-secondary block">50+</span>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">Detailing Crew</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leadership Pillars */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-bold uppercase tracking-wider text-xs block mb-1">
              What Guides Us
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark">
              Our Leadership Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left space-y-3"
              >
                <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="font-heading font-extrabold text-dark text-base">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-primary to-[#0D3B8E] rounded-[32px] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold">
              Ready to Experience Showroom Shine at Your Doorstep?
            </h3>
            <p className="text-blue-100 text-sm max-w-xl">
              Book a doorstep detailing session today or join our growing crew of professional detailers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/book"
              className="bg-secondary text-dark font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors text-center shadow-lg uppercase tracking-wider"
            >
              Book Detailing Now
            </Link>
            <Link
              to="/jobs"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm px-6 py-3.5 rounded-xl transition-colors text-center border border-white/20 uppercase tracking-wider"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
