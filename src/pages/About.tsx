import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Target, Award, Shield, Heart, Users, Sparkles, Droplets, ArrowRight } from "lucide-react";
import { getAboutSettings, dbAboutSettings, DEFAULT_ABOUT_SETTINGS, getRealtimeCompanyStats, RealtimeCompanyStats } from "../services/dbService";
import SEO from "../components/seo/SEO";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "../utils/seoSchemas";

export default function AboutPage() {
  const [settings, setSettings] = useState<dbAboutSettings>(DEFAULT_ABOUT_SETTINGS);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeCompanyStats | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const data = await getAboutSettings();
      setSettings(data);
      const rt = await getRealtimeCompanyStats();
      setRealtimeStats(rt);
    }
    loadSettings();
  }, []);

  const stats = [
    { number: realtimeStats ? realtimeStats.carsCleaned : "0", label: settings.stat1Label || "Cars Cleaned" },
    { number: realtimeStats ? realtimeStats.satisfaction : "0%", label: settings.stat2Label || "Satisfaction Rate" },
    { number: realtimeStats ? `${realtimeStats.topRating}★` : "0.0★", label: settings.stat3Label || "Customer Rating" },
    { number: realtimeStats ? realtimeStats.teamMembers : "0", label: settings.stat4Label || "Team Members" }
  ];

  const values = [
    {
      icon: <Shield className="text-secondary" size={28} />,
      title: "100% Paint Protection",
      description: "We use scratch-free microfiber mitts, high-lubricity pH neutral shampoos, and clean water grit guards."
    },
    {
      icon: <Droplets className="text-secondary" size={28} />,
      title: "Water Conservation",
      description: "Our mobile detailing process saves up to 150 liters of water per wash compared to conventional stations."
    },
    {
      icon: <Sparkles className="text-secondary" size={28} />,
      title: "Uncompromising Quality",
      description: "From tire shine sealants to dashboard UV conditioners, we use professional grade compounds."
    },
    {
      icon: <Users className="text-secondary" size={28} />,
      title: "Empowering Local Youth",
      description: "We provide flexible part-time earnings and professional detailing technical training for students."
    }
  ];

  const breadcrumbs = [{ name: "About Us", path: "/about" }];

  return (
    <div className="min-h-screen bg-light">
      <SEO 
        title="About Us | VA Car & Bike Care"
        description="Learn about VA Car & Bike Care, Kanpur's leading eco-friendly doorstep car detailing company. Discover our mission, values, and expert team."
        keywords="About VA Car Care, car detailing kanpur company, doorstep vehicle wash history, eco friendly wash"
        schemas={[
          getBreadcrumbSchema(breadcrumbs),
          getLocalBusinessSchema()
        ]}
      />
      {/* Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-semibold tracking-wider uppercase text-[11px] mb-2 block"
          >
            {settings.badge}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold max-w-3xl mx-auto leading-[1.1] tracking-tight mb-3"
          >
            {settings.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            {settings.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Main Story */}
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative h-[420px] rounded-[32px] overflow-hidden shadow-2xl"
          >
            <img
              src={settings.storyImageUrl || "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200"}
              alt="Deep luxury detailing"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-primary/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-4 text-left"
          >
            <span className="text-primary font-bold text-xs tracking-widest uppercase block">
              Our Journey &amp; Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark leading-tight">
              {settings.storyHeading}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              {settings.storyText1}
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              {settings.storyText2}
            </p>
          </motion.div>
        </div>

        {/* Dynamic Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-1">
              <h3 className="text-3xl md:text-4xl font-heading font-black text-primary">{stat.number}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission / Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 p-8 md:p-10 rounded-[32px] border border-primary/10 space-y-3 text-left"
          >
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-dark">
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              To deliver pristine detailing convenience that saves water, uses modern eco-safe chemicals, and restores every vehicle to its peak aesthetic potential without disrupting our clients' day.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/5 p-8 md:p-10 rounded-[32px] border border-secondary/10 space-y-3 text-left"
          >
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-dark">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-heading font-extrabold text-dark">
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              To become India's primary brand for doorstep luxury car detailing services and create hundreds of meaningful, flexible part-time employment opportunities for students and young freelancers.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-bold uppercase tracking-wider text-xs block mb-1">
              Beliefs &amp; Standard
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-dark">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm text-center space-y-3"
              >
                <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center mx-auto">
                  {val.icon}
                </div>
                <h3 className="font-heading font-extrabold text-dark text-base">{val.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Founders & Leadership Section Link */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0B1220] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-12 border border-white/10"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-secondary font-bold uppercase tracking-widest text-xs inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                <Users size={14} /> Leadership &amp; Founders
              </span>
              <h3 className="text-2xl md:text-4xl font-heading font-extrabold leading-tight text-white">
                Meet Our Founders
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Discover the story, vision, and dedication of the leadership behind VA Car &amp; Bike Care — driving eco-friendly mobile car detailing innovation across Kanpur.
              </p>
            </div>

            {/* Founder Avatars Preview + CTA Button */}
            <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
              <div className="flex items-center -space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#F4B400] overflow-hidden bg-gray-800 shadow-lg" title="Veeru - Founder & CEO">
                  <img src="/founders/founder1.png" alt="Veeru" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"; }} />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#F4B400] overflow-hidden bg-gray-800 shadow-lg" title="Akhlesh - Co-Founder & Head of Field Operations">
                  <img src="/founders/founder2.png" alt="Akhlesh" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"; }} />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#F4B400] overflow-hidden bg-gray-800 shadow-lg" title="Sanket - Co-Founder & Head of Operations">
                  <img src="/founders/founder3.png" alt="Sanket" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"; }} />
                </div>
              </div>

              <Link
                to="/founders"
                className="inline-flex items-center gap-2 bg-[#F4B400] hover:bg-yellow-300 text-dark font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-yellow-400/20 uppercase tracking-wider group cursor-pointer"
              >
                <span>View Founders Details</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
