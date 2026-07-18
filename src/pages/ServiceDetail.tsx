import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Droplets,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { getAllServices, dbService, defaultServices } from "../services/dbService";

// Pre-configured terms and conditions & inclusions lookup for standard and custom services
const serviceTermsAndDetails: Record<string, {
  steps: Array<{ title: string; desc: string }>;
  terms: string[];
  duration: string;
  waterReq: string;
}> = {
  "exterior": {
    duration: "45-60 Minutes",
    waterReq: "Requires standard hose attachment or 2 buckets clean water.",
    steps: [
      { title: "Foam Pre-soak", desc: "Thick dirt-encapsulating shampoo blanket to break down grit safely." },
      { title: "Hand Detailing Wash", desc: "Plush scratch-free mitts and double-bucket grid system wash." },
      { title: "Rim & Tyre Blast", desc: "Cleans brake dust and heavy road grime from wheels & arches." },
      { title: "Microfiber Towel Dry", desc: "Streak-free dry with ultra-absorbent deep-pile microfiber cloths." }
    ],
    terms: [
      "Vehicle must be parked in a safe driveway, parking slot, or private lawn with clearance.",
      "Pre-existing paint chips, deep swirl marks, or clear-coat peeling will be documented prior to wash.",
      "Free cancellation or slot rescheduling available up to 1 hour before scheduled technician dispatch.",
      "100% Satisfaction Guarantee: Any missed exterior spots will be re-cleaned immediately on the spot."
    ]
  },
  "interior": {
    duration: "60-90 Minutes",
    waterReq: "Requires 5A/15A standard power socket within 25 meters for vacuum system.",
    steps: [
      { title: "Cabin Deep Vacuuming", desc: "High-power suction for floor mats, seats, boot space & crevices." },
      { title: "Dashboard & Console Polish", desc: "Non-greasy UV protective shield for plastic and vinyl surfaces." },
      { title: "Upholstery Spot Extractor", desc: "Deep stain reduction on fabric seats & leather conditioner application." },
      { title: "Interior Glass Polish", desc: "Crystal clear streak-free windshield & mirror polish." }
    ],
    terms: [
      "Please remove personal valuables, cash, and sensitive documents from cabin & glovebox before service.",
      "Technician requires access to open vehicle doors comfortably on both sides.",
      "Old stubborn chemical stains may require multiple treatments for complete removal.",
      "Free cancellation or slot rescheduling available up to 1 hour before scheduled technician dispatch."
    ]
  },
  "foam-wash": {
    duration: "45-60 Minutes",
    waterReq: "Water supply access required.",
    steps: [
      { title: "Snow Foam Cannon Blast", desc: "Ultra-dense pH-neutral foam coating that dissolves tough road grime." },
      { title: "Underbody Pressure Rinse", desc: "Rinses mud and corrosive salt residue from undercarriage." },
      { title: "Hydrophobic Gloss Spray", desc: "Instant shine sealant for mirror gloss and water beading effect." }
    ],
    terms: [
      "Snow foam polymers are 100% pH-neutral and safe for ceramic coatings and paint wraps.",
      "Technician will require space for high-pressure foam lance maneuvering.",
      "Free cancellation or slot rescheduling available up to 1 hour before scheduled technician dispatch."
    ]
  },
  "wax-polish": {
    duration: "75-90 Minutes",
    waterReq: "No extra water needed.",
    steps: [
      { title: "Paint Decontamination", desc: "Clay bar treatment removing embedded tar and industrial fallout." },
      { title: "Carnauba Wax Buffing", desc: "Hand-applied premium wax coat restoring deep wet-look gloss." },
      { title: "Paint Sealant Shield", desc: "Hydrophobic shield protecting paint against UV oxidation & bird droppings." }
    ],
    terms: [
      "Paint wax protects clear coat up to 3 months under normal driving conditions.",
      "Surface scratch removal requires machine compound polishing (available on request).",
      "Free cancellation or slot rescheduling available up to 1 hour before scheduled technician dispatch."
    ]
  }
};

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<dbService | null>(null);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadService() {
      setLoading(true);
      try {
        const allServices = await getAllServices();
        const found = allServices.find((s) => s.id === serviceId || s.name.toLowerCase().replace(/\s+/g, "-") === serviceId);
        
        if (found) {
          setService(found);
        } else {
          // Check default fallback services
          const def = defaultServices.find((s) => s.id === serviceId || s.name.toLowerCase().replace(/\s+/g, "-") === serviceId);
          if (def) setService(def);
        }
      } catch (err) {
        console.error("Failed to load service detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 min-h-screen bg-[#F8FAFC] text-center px-4">
        <h2 className="text-2xl font-bold text-dark">Service Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">The detailing package you requested is unavailable.</p>
        <Link to="/services" className="inline-block mt-6 text-primary font-bold text-xs uppercase tracking-wider hover:underline">
          ← Back to All Services
        </Link>
      </div>
    );
  }

  const key = service.id.toLowerCase();
  const detailData = serviceTermsAndDetails[key] || {
    duration: "45-75 Minutes",
    waterReq: "Requires standard water access & electricity socket in driveway.",
    steps: [
      { title: "Pre-Inspection", desc: "Technician inspects paint condition and customer requirements." },
      { title: "Deep Detailing Execution", desc: `Professional cleaning using ${service.name} specialized compounds.` },
      { title: "Quality Audit", desc: "Final inspection ensuring 100% streak-free showroom finish." }
    ],
    terms: [
      "Vehicle must be parked in an accessible driveway, slot, or lawn with work space.",
      "Please remove personal belongings from cabin prior to interior service.",
      "Free cancellation up to 1 hour before scheduled technician dispatch time.",
      "100% Satisfaction Guarantee: Any missed spots are re-cleaned immediately."
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden text-left">
      {/* Dark Header Top */}
      <div className="bg-[#070C16] pt-24 pb-6 mb-8">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          {/* Breadcrumb Navigation */}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight size={12} />
            <span className="text-[#F4B400]">{service.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">

        {/* Hero Card Banner */}
        <div className="bg-gradient-to-r from-dark via-[#0b2861] to-primary rounded-3xl p-6 md:p-10 text-white shadow-xl mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-secondary text-dark text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow">
                <Sparkles size={12} /> Verified Doorstep Detailing Service
              </span>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight leading-[1.1]">
                {service.name}
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center shrink-0 w-full md:w-auto space-y-3">
              <div>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">Starting Price</span>
                <span className="text-3xl md:text-4xl font-black text-secondary font-heading">₹{service.price}</span>
              </div>
              <Button
                onClick={() => navigate("/book", { state: { selectedService: service.name } })}
                className="w-full bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold py-3 text-xs uppercase tracking-wider rounded-xl shadow-lg border-none cursor-pointer"
              >
                Book This Service <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Process Steps & Conditions */}
          <div className="lg:col-span-7 space-y-10">
            {/* Quick Service Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Estimated Duration</span>
                  <p className="text-xs font-extrabold text-dark mt-0.5">{detailData.duration}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Droplets size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Site Requirement</span>
                  <p className="text-[11px] font-bold text-gray-700 leading-tight mt-0.5">{detailData.waterReq}</p>
                </div>
              </div>
            </div>

            {/* Inclusions / Steps */}
            <div className="space-y-4">
              <h3 className="text-xl font-heading font-extrabold text-dark flex items-center gap-2">
                <CheckCircle2 size={22} className="text-emerald-500" />
                What's Included in This Service
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {detailData.steps.map((step, idx) => (
                  <div key={idx} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-dark text-sm">{step.title}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SPECIFIC TERMS & CONDITIONS SECTION */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-amber-950 flex items-center gap-2">
                <FileText size={20} className="text-amber-600" />
                Service Specific Terms & Conditions
              </h3>
              
              <ul className="space-y-3">
                {detailData.terms.map((term, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-amber-900 font-semibold leading-relaxed">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: Visual Restoration Slider & Guarantee */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-dark flex items-center gap-2">
                <Eye size={18} className="text-primary" />
                Restoration Quality Preview
              </h3>

              <div className="relative h-72 rounded-2xl overflow-hidden shadow-md border border-gray-200 group">
                <img
                  src={service.image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800"}
                  alt="Restored finish"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
                <div className="absolute left-3 bottom-3 bg-[#F4B400] text-dark font-heading font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shadow">
                  ✨ Verified Detailing Finish
                </div>
              </div>
            </div>

            {/* Guarantee Shield Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <ShieldCheck size={20} className="text-emerald-600" />
                <span>100% Doorstep Satisfaction Guarantee</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                We bring our own eco-friendly waterless/foam wash formulas, non-scratch microfiber towels, and portable high-vacuum tools right to your driveway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
