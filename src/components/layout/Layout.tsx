import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CustomCursor from "../ui/CustomCursor";
import SmoothScroll from "../common/SmoothScroll";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageCircle, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { getContactSettings, dbContactSettings, DEFAULT_CONTACT_SETTINGS } from "../../services/dbService";
import ErrorBoundary from "../common/ErrorBoundary";
import { usePerformanceMode } from "../../hooks/usePerformanceMode";

export default function Layout() {
  const location = useLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [contactSettings, setContactSettings] = useState<dbContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const { isLowEnd, prefersReducedMotion } = usePerformanceMode();

  useEffect(() => {
    async function loadSettings() {
      const data = await getContactSettings();
      setContactSettings(data);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsappNum = (contactSettings.whatsappNumber || "918882540255").replace(/[^\d]/g, "");
  const whatsappMsg = encodeURIComponent(contactSettings.whatsappMessage || "Hello VA Detailing, I want to inquire about car cleaning & detailing services.");
  const phoneNum = (contactSettings.phone1 || "+919569949626").replace(/[^\d+]/g, "");

  // Smooth page transition variants tuned for GPU performance
  const pageVariants = {
    initial: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : isLowEnd ? 8 : 14,
      scale: prefersReducedMotion || isLowEnd ? 1 : 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : isLowEnd ? -8 : -14,
      scale: prefersReducedMotion || isLowEnd ? 1 : 0.995,
    },
  };

  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-[#070C16]">
        <CustomCursor />
        <Navbar />
        <main className="flex-grow w-full max-w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{
                duration: prefersReducedMotion ? 0 : isLowEnd ? 0.22 : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="transform-gpu will-change-transform"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
          <motion.a
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            title="Chat on WhatsApp"
            className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white cursor-pointer transform-gpu transition-all"
          >
            <MessageCircle size={22} />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={`tel:${phoneNum}`}
            title="Call Helpline"
            className="w-12 h-12 bg-[#0F172A] hover:bg-black rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/20 cursor-pointer transform-gpu transition-all"
          >
            <Phone size={20} />
          </motion.a>

          <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/book"
              title="Book Now"
              className="w-12 h-12 bg-[#0D3B8E] hover:bg-blue-800 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white cursor-pointer md:hidden flex transform-gpu transition-all"
            >
              <CalendarClock size={20} />
            </Link>
          </motion.div>

          <AnimatePresence>
            {showTopBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 10 }}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={scrollToTop}
                title="Scroll to Top of Page"
                className="w-12 h-12 bg-[#0F172A] hover:bg-black rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/20 cursor-pointer transform-gpu"
              >
                <ArrowUp size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SmoothScroll>
  );
}
