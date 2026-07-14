import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import vaLogo from "@/assets/va logo.png";
import vaIntroVideo from "@/assets/va-intro-cropped.mp4";

interface LoaderProps {
  onComplete?: () => void;
}

/* ── localStorage helpers ─────────────────────────────── */
const STORAGE_KEY = "va_loader_shown_date";

function isFirstVisitToday(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    const today = new Date().toDateString();
    return stored !== today;
  } catch {
    return true;
  }
}

function markVisitedToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
  } catch {}
}

/* ── Main Loader ──────────────────────────────────────── */
export default function Loader({ onComplete }: LoaderProps) {
  // Decide ONCE at mount — never changes during the component's lifetime
  const [firstVisit] = useState<boolean>(isFirstVisitToday);

  const [isVisible, setIsVisible] = useState(true);
  const [barWidth, setBarWidth] = useState(0); // 0-100
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);

  /* ── Dismiss (called once) ── */
  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsVisible(false);
    onComplete?.();
  };

  /* ── Mark today on first visit ── */
  useEffect(() => {
    if (firstVisit) markVisitedToday();
  }, [firstVisit]);

  /* ── First visit: sync progress bar to video ── */
  useEffect(() => {
    if (!firstVisit) return;

    const el = videoRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      if (el.duration > 0) {
        setBarWidth((el.currentTime / el.duration) * 100);
      }
    };

    const onEnded = () => {
      setBarWidth(100);
      setTimeout(dismiss, 500);
    };

    const onError = () => {
      // video failed — dismiss quickly
      setTimeout(dismiss, 800);
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    // Hard timeout fallback
    const timeout = setTimeout(() => {
      setBarWidth(100);
      dismiss();
    }, 13000);

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      clearTimeout(timeout);
    };
  }, [firstVisit]);

  /* ── Return visits: animate progress bar independently ── */
  useEffect(() => {
    if (firstVisit) return;

    const interval = setInterval(() => {
      setBarWidth((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 15) + 5, 100);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(dismiss, 600);
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [firstVisit]);

  /* ── Render ── */
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] bg-[#060d1a] flex flex-col items-center justify-center px-4"
        >
          {/* ── Ambient floating bubbles ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <motion.div
              animate={{ y: [-20, -120], x: [-10, 10], opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
              className="absolute bottom-1/4 left-1/4 w-3 h-3 rounded-full bg-primary"
            />
            <motion.div
              animate={{ y: [0, -150], x: [10, -10], opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 0.8 }}
              className="absolute bottom-1/3 right-1/4 w-4 h-4 rounded-full bg-secondary"
            />
            <motion.div
              animate={{ y: [20, -100], opacity: [0, 0.6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 1.2 }}
              className="absolute bottom-1/2 left-1/3 w-2 h-2 rounded-full bg-white"
            />
          </div>

          {/* ── Content card ── */}
          <div className="text-center relative max-w-sm w-full">

            {/* Spinning sparkles */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6], rotate: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute -top-12 left-12 text-secondary"
            >
              <Sparkles size={28} />
            </motion.div>
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5], rotate: [180, 360, 540] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 0.5 }}
              className="absolute top-16 right-4 text-primary"
            >
              <Sparkles size={20} />
            </motion.div>

            {/* ── Centre: Video (first visit) OR Logo (return visit) ── */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6 flex items-center justify-center"
            >
              {firstVisit ? (
                /* Video replaces logo on first day visit */
                <div className="relative w-48 aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/30 ring-1 ring-white/10">
                  <video
                    ref={videoRef}
                    src={vaIntroVideo}
                    autoPlay
                    muted
                    playsInline
                    disablePictureInPicture
                    disableRemotePlayback
                    className="w-full h-full object-cover"
                  />
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-xl ring-2 ring-primary/40 pointer-events-none"
                  />
                </div>
              ) : (
                /* VA logo on return visits */
                <div className="relative w-24 h-24 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <img
                    src={vaLogo}
                    alt="VA Detailing Logo"
                    className="w-full h-full object-contain"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-primary rounded-3xl blur-md -z-10"
                  />
                </div>
              )}
            </motion.div>

            {/* Brand title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-heading font-extrabold text-white tracking-wider mb-2"
            >
              VA CAR <span className="text-secondary">CLEANING</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
              className="text-xs tracking-widest text-gray-400 font-semibold mb-8 uppercase"
            >
              आपकी कार, हमारी जिम्मेदारी
            </motion.p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: `${barWidth}%` }}
                transition={{ ease: "easeInOut", duration: 0.15 }}
              />
            </div>

            {/* Percentage */}
            <motion.span
              key={Math.round(barWidth)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono font-bold text-gray-400"
            >
              {Math.round(barWidth)}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
