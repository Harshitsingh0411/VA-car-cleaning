import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Target, Award, Shield, Heart, Users, Sparkles, Droplets } from "lucide-react";
import { getAboutSettings, dbAboutSettings, DEFAULT_ABOUT_SETTINGS, getRealtimeCompanyStats, RealtimeCompanyStats } from "../services/dbService";
import SEO from "../components/seo/SEO";

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
    { number: realtimeStats ? realtimeStats.carsCleaned : (settings.stat1Number || "1000+"), label: settings.stat1Label || "Cars Cleaned" },
    { number: realtimeStats ? realtimeStats.satisfaction : (settings.stat2Number || "100%"), label: settings.stat2Label || "Satisfaction Rate" },
    { number: realtimeStats ? `${realtimeStats.topRating}★` : (settings.stat3Number || "4.9★"), label: settings.stat3Label || "Customer Rating" },
    { number: realtimeStats ? realtimeStats.teamMembers : (settings.stat4Number || "50+"), label: settings.stat4Label || "Team Members" }
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

  return (
    <div className="min-h-screen bg-light">
      <SEO 
        title="About Us | VaCar Cleaning Service"
        description="Learn about VaCar Cleaning Service, Kanpur's leading eco-friendly doorstep car detailing company. Discover our mission, values, and expert team."
      />
      {/* Banner */}
      <div className="bg-[#070C16] text-white pt-24 pb-12 md:pt-28 md:pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
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
            />
            <div className="absolute inset-0 bg-primary/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-4"
          >
            <span className="text-primary font-bold text-xs tracking-widest uppercase block">
              Our Journey & Mission
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
            className="bg-primary/5 p-8 md:p-10 rounded-[32px] border border-primary/10 space-y-3"
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
            className="bg-secondary/5 p-8 md:p-10 rounded-[32px] border border-secondary/10 space-y-3"
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
              Beliefs & Standard
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
      </div>
    </div>
  );
}
