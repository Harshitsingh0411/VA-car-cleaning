import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Car, Phone, Bell, LogIn, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import vaLogo from "@/assets/va logo.png";
import {
  subscribeToNotifications,
  requestNotificationPermission,
  triggerBrowserNotification
} from "../../services/notificationService";
import { getCartoonAvatar, handleAvatarError } from "../../utils/avatar";

import { seoServices, seoLocations } from "../../data/seoData";

const navLinks = [
  { name: "Home", path: "/" },
  { 
    name: "Services", 
    path: "/services",
    dropdown: seoServices.slice(0, 6).map(s => ({ name: s.name, path: `/services/${s.slug}` })) 
  },
  { 
    name: "Locations", 
    path: "#",
    dropdown: seoLocations.slice(0, 8).map(l => ({ name: l.name, path: `/kanpur/${l.slug}` }))
  },
  { name: "Pricing", path: "/pricing" },
  { name: "Blog", path: "/blog" },
  { name: "About Us", path: "/about" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isInnerPage = location.pathname !== "/";
  const shouldStyleScrolled = isScrolled || isInnerPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    requestNotificationPermission(user.uid);

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);

      const storedLastTime = localStorage.getItem(`last_notif_time_${user.uid}`);
      const latestNotif = notifs[0];
      if (latestNotif && !latestNotif.read) {
        const latestTime = new Date(latestNotif.createdAt).getTime();
        const lastSeenTime = storedLastTime ? Number(storedLastTime) : 0;
        if (latestTime > lastSeenTime) {
          triggerBrowserNotification(
            latestNotif.title,
            latestNotif.description,
            latestNotif.imageUrl,
            latestNotif.deepLink
          );
          localStorage.setItem(`last_notif_time_${user.uid}`, latestTime.toString());
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        shouldStyleScrolled
          ? "bg-[#0B1220]/95 backdrop-blur-md shadow-lg py-3 border-b border-white/5"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 group-hover:scale-110 transition-transform shadow-md flex items-center justify-center">
            <img src={vaLogo} alt="VA Detailing Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] tracking-widest font-black text-[#F4B400]">
              CAR CLEANING
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 shrink-0 relative">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                to={link.path}
                className={cn(
                  "font-bold text-[10px] xl:text-xs uppercase tracking-wider whitespace-nowrap transition-colors relative py-6 flex items-center gap-1",
                  shouldStyleScrolled ? "text-gray-300 hover:text-white" : "text-gray-300 hover:text-white"
                )}
              >
                {link.name}
                {link.dropdown && <ChevronDown size={14} />}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 bottom-4 h-0.5 bg-[#F4B400]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>

              {/* Dropdown Menu */}
              {link.dropdown && (
                <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 border border-gray-100 overflow-hidden z-50">
                  <div className="p-2 grid grid-cols-1 gap-1">
                    {link.dropdown.map(dropItem => (
                      <Link 
                        key={dropItem.name} 
                        to={dropItem.path}
                        className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {dropItem.name}
                      </Link>
                    ))}
                    {link.name === "Services" && (
                      <Link to="/services" className="block px-4 py-3 text-xs font-bold text-primary text-center hover:bg-gray-50 border-t border-gray-100 mt-1">
                        View All Services
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Contact Helpline & CTA Button */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
          <a
            href="tel:+919569949626"
            className="flex items-center gap-1.5 text-white font-bold text-xs hover:text-[#F4B400] transition-colors shrink-0"
            title="Call Helpline"
          >
            <Phone size={14} className="text-[#F4B400] shrink-0" />
            <span className="hidden xl:inline whitespace-nowrap">+91 95699 49626</span>
          </a>

          {user && (
            <Link to="/notifications" className="relative text-gray-300 hover:text-[#F4B400] transition-colors p-1.5 cursor-pointer shrink-0" title="Notification Center">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black leading-none border border-[#0B1220]">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <Link to="/account" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-[#F4B400] transition-colors">
                <img
                  src={user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                  onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                  alt="My Profile avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors max-w-[65px] truncate whitespace-nowrap">
                {user.displayName || "Account"}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="shrink-0">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:border-white/40 font-bold text-[10px] uppercase tracking-wider px-3 h-8.5 rounded-lg">
                Login
              </Button>
            </Link>
          )}

          <Link to="/book" className="shrink-0">
            <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold text-[10px] uppercase tracking-wider px-4 h-8.5 rounded-lg border-none shadow-lg">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <>
              <Link to="/notifications" className="relative text-gray-300 hover:text-[#F4B400] transition-colors p-1.5 cursor-pointer shrink-0" title="Notification Center">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black leading-none border border-[#0B1220]">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-1.5 p-1 rounded-full border border-white/20 hover:border-[#F4B400] transition-colors shrink-0"
                title="Account"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#F4B400]/40">
                  <img
                    src={user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                    onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                    alt="Account"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-200 max-w-[60px] truncate hidden sm:inline">
                  {user.displayName ? user.displayName.split(" ")[0] : "Account"}
                </span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="shrink-0" title="Login">
              <Button
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 hover:border-white/40 font-bold text-[10px] uppercase tracking-wider px-2.5 h-8 rounded-lg flex items-center gap-1"
              >
                <LogIn size={13} className="text-[#F4B400]" />
                <span>Login</span>
              </Button>
            </Link>
          )}

          <button
            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-[#0B1220] shadow-xl py-6 px-6 flex flex-col gap-4 lg:hidden border-b border-white/10 overflow-hidden"
          >
            {navLinks.map((link, index) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={link.name}
              >
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-semibold text-sm uppercase text-gray-300 hover:text-white block py-2 border-b border-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.05 }}
              className="flex flex-col gap-3 mt-4"
            >
              <a
                href="tel:+919569949626"
                className="flex items-center gap-2 text-white font-bold text-sm py-2 hover:text-[#F4B400] transition-colors"
              >
                <Phone size={16} className="text-[#F4B400]" />
                <span>+91 95699 49626</span>
              </a>

              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F4B400]/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#F4B400]">
                      <img
                        src={user.photoURL || getCartoonAvatar(user.email || user.displayName || user.uid)}
                        onError={(e) => handleAvatarError(e, user.email || user.displayName || user.uid)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {user.displayName || "My Account"}
                      </span>
                      <span className="text-[11px] text-[#F4B400] font-medium">Account Settings & Bookings</span>
                    </div>
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 border-t border-white/5 text-sm font-semibold text-white"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={16} className="text-gray-400" />
                      <span>Notifications Center</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-white border-white/15 hover:bg-white/5 py-2.5 flex items-center justify-center gap-2 font-bold">
                    <LogIn size={16} className="text-[#F4B400]" />
                    <span>Login / Register</span>
                  </Button>
                </Link>
              )}

              <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-[#F4B400] text-dark hover:bg-[#ffe258] border-none font-bold">
                  Book Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
