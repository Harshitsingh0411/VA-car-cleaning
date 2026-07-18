import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CustomCursor from "../ui/CustomCursor";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Phone, MessageCircle, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { getContactSettings, dbContactSettings, DEFAULT_CONTACT_SETTINGS } from "../../services/dbService";

export default function Layout() {
  const location = useLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [contactSettings, setContactSettings] = useState<dbContactSettings>(DEFAULT_CONTACT_SETTINGS);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const whatsappNum = (contactSettings.whatsappNumber || "918882540255").replace(/[^\d]/g, "");
  const whatsappMsg = encodeURIComponent(contactSettings.whatsappMessage || "Hello VA Detailing, I want to inquire about car cleaning & detailing services.");
  const phoneNum = (contactSettings.phone1 || "+919569949626").replace(/[^\d+]/g, "");

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-[#070C16]">
      <CustomCursor />
      <Navbar />
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
        <a
          href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
          target="_blank"
          rel="noreferrer"
          title="Chat on WhatsApp"
          className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform border-2 border-white cursor-pointer"
        >
          <MessageCircle size={22} />
        </a>
        <a
          href={`tel:${phoneNum}`}
          title="Call Helpline"
          className="w-12 h-12 bg-dark hover:bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform border-2 border-white/20 cursor-pointer"
        >
          <Phone size={20} />
        </a>
        <Link
          to="/book"
          title="Book Now"
          className="w-12 h-12 bg-primary hover:bg-blue-800 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform border-2 border-white cursor-pointer md:hidden"
        >
          <CalendarClock size={20} />
        </Link>
        <AnimatePresence>
          {showTopBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              title="Scroll to Top of Page"
              className="w-12 h-12 bg-dark hover:bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform border-2 border-white/20 cursor-pointer"
            >
              <ArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
