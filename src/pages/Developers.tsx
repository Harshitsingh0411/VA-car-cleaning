import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Code2,
  Linkedin,
  Github,
  Instagram,
  Mail,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
  ChevronDown,
  CheckCircle2
} from "lucide-react";
import { getDevelopersSettings, dbDevelopersSettings, DEFAULT_DEVELOPERS_SETTINGS } from "../services/dbService";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "../utils/seoSchemas";

export default function DevelopersPage() {
  const [data, setData] = useState<dbDevelopersSettings>(DEFAULT_DEVELOPERS_SETTINGS);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getDevelopersSettings();
        setData(res);
      } catch (err) {
        console.error("Error loading developers data:", err);
      }
    }
    loadData();
  }, []);

  const breadcrumbs = [
    { name: "About Us", path: "/about" },
    { name: "Software Developers", path: "/developers" }
  ];

  const techFeatures = [
    {
      icon: <Code2 className="text-[#F4B400]" size={24} />,
      title: "Frontend Engineering",
      desc: "Built with React 19, Vite, and TypeScript ensuring lightning-fast rendering and modular state flow."
    },
    {
      icon: <Terminal className="text-[#F4B400]" size={24} />,
      title: "Real-time Database",
      desc: "Powered by Cloud Firestore and real-time listeners for instantaneous booking updates and admin sync."
    },
    {
      icon: <Layers className="text-[#F4B400]" size={24} />,
      title: "UI/UX & Glassmorphism",
      desc: "Crafted with Tailwind CSS, custom design tokens, and smooth Framer Motion micro-interactions."
    },
    {
      icon: <Cpu className="text-[#F4B400]" size={24} />,
      title: "Performance & PWA",
      desc: "Optimized for mobile-first devices with adaptive performance mode, caching, and PWA capabilities."
    }
  ];

  return (
    <div className="min-h-screen bg-light text-dark">
      <SEO
        title="Software Developers | Harshit Singh & Divyanshu Kashyap | VA Car Care"
        description="Learn about the software developers behind VA Car & Bike Care platform — Harshit Singh and Divyanshu Kashyap. Built with modern full-stack web technologies."
        keywords="Software Developed by Harshit Singh and Divyanshu Kashyap, VA Car Care developers, web development team, full stack engineers"
        schemas={[
          getBreadcrumbSchema(breadcrumbs),
          getLocalBusinessSchema()
        ]}
      />

      {/* Hero Header Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 sm:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/15" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="flex justify-center mb-5">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-heading font-black max-w-3xl mx-auto leading-tight tracking-tight mb-3 text-center"
          >
            Software Developed By <br className="hidden sm:inline" />
            <span className="text-[#F4B400]">Harshit Singh</span> &amp; <br className="hidden sm:inline" />
            <span className="text-[#F4B400]">Divyanshu Kashyap</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 mb-4"
          >
            <span className="text-xs text-gray-300 font-medium">Website Created With</span>
            <a
              href="https://www.ours2026.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4B400] font-extrabold text-xs hover:underline inline-flex items-center gap-1.5"
            >
              <img src="/ours-logo.png" alt="OURS Logo" className="w-4 h-4 object-contain rounded-full" />
              <span>OURS Team</span>
              <ExternalLink size={13} />
            </a>
          </motion.div>



          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed text-center px-4"
          >
            {data.subtitle || "Designed and engineered with cutting-edge web performance, real-time booking engines, seamless UI/UX, and robust cloud infrastructure."}
          </motion.p>
        </div>
      </div>

      {/* Main Developers Section */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#0D3B8E] font-extrabold uppercase tracking-widest text-[11px] block mb-1">
            {data.badge || "MEET THE CODERS"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-dark">
            Software Developers
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            The software development team responsible for designing, building, and maintaining the VA Cars &amp; Bike Cares application platforms.
          </p>
        </div>

        {/* Developer Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16">
          {data.developers.map((dev, index) => (
            <motion.div
              key={dev.id || index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="bg-white rounded-[28px] p-5 sm:p-7 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group space-y-5"
            >
              <div className="space-y-4">
                {/* Top Row: Left Image + Right Details */}
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Thumbnail Photo */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={dev.image || (index === 0 ? "/developers/harshit.png" : "/developers/divyanshu.png")}
                      alt={dev.name}
                      className="w-full h-full object-cover"
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
                        img.src = index === 0
                          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                          : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                  </div>

                  {/* Right Details Column */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#0D3B8E] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 block w-fit leading-none mb-1">
                      {dev.role}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-dark leading-tight truncate">
                      {dev.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 flex items-center gap-1.5 pt-0.5">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span>Software Developer &amp; Tech Contributor</span>
                    </p>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {dev.bio}
                </p>

                {/* Core Expertise & Stack */}
                {dev.skills && dev.skills.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                      CORE EXPERTISE &amp; STACK
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dev.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-gray-50 text-gray-700 font-bold text-[11px] px-3 py-1 rounded-lg border border-gray-200/80 shadow-2xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action / Social Bar */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md group/btn"
                >
                  <Linkedin size={16} />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                  {dev.github && (
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-dark hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                      title="GitHub Profile"
                    >
                      <Github size={16} />
                    </a>
                  )}
                  {dev.instagram && (
                    <a
                      href={dev.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white flex items-center justify-center text-pink-600 transition-all shadow-2xs"
                      title="Instagram Profile"
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  {dev.email && (
                    <a
                      href={`mailto:${dev.email}`}
                      className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-primary hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack & Engineering Architecture Section */}
        <div className="bg-[#0B1220] rounded-[36px] p-6 sm:p-10 md:p-14 text-white relative overflow-hidden mb-16 border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
            <span className="text-secondary font-bold uppercase tracking-widest text-[11px] block mb-1">
              Engineering Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold">
              {data.techStackHeading || "Built With Modern Tech Stack"}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-2">
              Designed for extreme speed, scalability, accessibility, and high performance across all mobile and desktop devices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {techFeatures.map((f, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5 text-left hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-heading font-extrabold text-white text-sm sm:text-base">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-primary via-[#0D3B8E] to-dark rounded-[32px] p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest block">
              Software Credits
            </span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold">
              VA Cars &amp; Bike Cares Platform
            </h3>
            <p className="text-gray-200 text-xs sm:text-sm max-w-xl leading-relaxed">
              Website created with{" "}
              <a
                href="https://www.ours2026.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4B400] font-extrabold hover:underline inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md border border-white/15"
              >
                <img src="/ours-logo.png" alt="OURS Logo" className="w-4 h-4 object-contain rounded-full" />
                <span>OURS Team</span>
                <ExternalLink size={14} />
              </a>{" "}
              (engineered by Harshit Singh &amp; Divyanshu Kashyap) to deliver seamless doorstep vehicle care experiences in Kanpur.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/about"
              className="bg-secondary text-dark font-extrabold text-xs px-6 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors text-center shadow-lg uppercase tracking-wider"
            >
              Explore About Us
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors text-center border border-white/20 uppercase tracking-wider"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
