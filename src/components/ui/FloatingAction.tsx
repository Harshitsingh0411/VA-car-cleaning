import React from 'react';
import { MessageCircle, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FloatingAction() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Floating Button */}
      <motion.a
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:bg-[#20bd5a] hover:scale-110 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </motion.a>

      {/* Sticky Book Now Button (Mainly for Mobile Conversion) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
      >
        <Link
          to="/book"
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(29,78,216,0.4)] hover:bg-blue-800 hover:scale-110 transition-all duration-300 md:hidden"
          aria-label="Book a Service"
        >
          <CalendarClock size={28} />
        </Link>
      </motion.div>
    </div>
  );
}
