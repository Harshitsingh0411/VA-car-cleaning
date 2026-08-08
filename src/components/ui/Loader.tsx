import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Sparkles, Clock, Leaf } from "lucide-react";
import vaLogo from "@/assets/va logo.png";
import vaIntroVideo from "@/assets/va-intro-cropped.mp4";

interface LoaderProps {
  onComplete?: () => void;
}

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

export default function Loader({ onComplete }: LoaderProps) {
  const [firstVisit] = useState<boolean>(isFirstVisitToday);
  const [isVisible, setIsVisible] = useState(true);
  const [barWidth, setBarWidth] = useState(0); // 0-100
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (firstVisit) markVisitedToday();
    setIsVisible(false);
    onComplete?.();
  };

  // Explicitly start video playback on mount when firstVisit is true
  useEffect(() => {
    if (!firstVisit) return;
    const el = videoRef.current;
    if (el) {
      el.muted = true;
      el.play().catch((err) => {
        console.warn("Video play deferred:", err);
      });
    }
  }, [firstVisit]);

  // First Visit Today: Smooth 60FPS RAF progress sync with intro video
  useEffect(() => {
    if (!firstVisit) return;

    let animFrameId: number;

    const syncVideoProgress = () => {
      const el = videoRef.current;
      if (el && el.duration > 0) {
        const targetPct = (el.currentTime / el.duration) * 100;
        setBarWidth((prev) => {
          const diff = targetPct - prev;
          if (diff > 0) {
            return Math.min(prev + Math.max(diff * 0.2, 0.1), 100);
          }
          return prev;
        });
      }
      animFrameId = requestAnimationFrame(syncVideoProgress);
    };

    animFrameId = requestAnimationFrame(syncVideoProgress);

    const el = videoRef.current;
    const onEnded = () => {
      setBarWidth(100);
      setTimeout(dismiss, 350);
    };

    const onError = () => {
      setTimeout(dismiss, 1000);
    };

    if (el) {
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
    }

    const timeout = setTimeout(() => {
      setBarWidth(100);
      dismiss();
    }, 12000);

    return () => {
      cancelAnimationFrame(animFrameId);
      if (el) {
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
      }
      clearTimeout(timeout);
    };
  }, [firstVisit]);

  // Subsequent Visits Today: Continuous 60FPS nonstop smooth glide
  useEffect(() => {
    if (firstVisit) return;

    let animFrameId: number;
    const startTime = Date.now();
    const duration = 2400; // 2.4s continuous smooth drive

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setBarWidth(progress);

      if (progress < 100) {
        animFrameId = requestAnimationFrame(step);
      } else {
        setTimeout(dismiss, 300);
      }
    };

    animFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animFrameId);
  }, [firstVisit]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] bg-[#050914] text-white flex flex-col items-center justify-between py-10 px-6 overflow-hidden select-none"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,71,255,0.18)_0%,_rgba(5,9,20,0.95)_70%)] pointer-events-none" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />

          <div className="flex-1" />

          {/* Center Brand & Media Container */}
          <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center">
            
            {/* First visit today: Intro Video Player | Return visits: VA Emblem Logo */}
            {firstVisit ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-64 md:w-80 aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/30 border border-white/20 mb-6 bg-black"
              >
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
                <div className="absolute inset-0 ring-1 ring-white/10 rounded-2xl pointer-events-none" />
              </motion.div>
            ) : (
              <div className="relative mb-6 group">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-50 -z-10"
                />
                <img
                  src={vaLogo}
                  alt="VA Car Detailing"
                  className="h-24 md:h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,71,255,0.5)]"
                />
              </div>
            )}

            {/* Brand Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-black tracking-[0.18em] text-white uppercase mb-2">
              VA CAR <span className="text-amber-500 font-black">CLEANING</span>
            </h1>

            {/* Hindi Tagline */}
            <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wider mb-8 flex items-center justify-center gap-2">
              <span className="w-6 h-[1px] bg-gray-600 inline-block" />
              <span>आपकी कार, हमारी जिम्मेदारी</span>
              <span className="w-6 h-[1px] bg-gray-600 inline-block" />
            </p>

            {/* Moving Car Progress Bar Track */}
            <div className="relative w-full h-2.5 bg-white/10 rounded-full my-4 backdrop-blur-sm border border-white/5 shadow-inner">
              
              {/* Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.9)] relative transition-none"
                style={{ width: `${barWidth}%`, willChange: "width" }}
              />

              {/* Nonstop Smooth Driving Car Icon attached to Progress Tip */}
              <div
                className="absolute -top-5 z-20 pointer-events-none transition-none"
                style={{ 
                  left: `calc(${Math.min(Math.max(barWidth, 3), 97)}% - 22px)`,
                  willChange: "left"
                }}
              >
                <motion.div
                  animate={{ y: [0, -1, 0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.35, ease: "linear" }}
                  className="relative transform -scale-x-100"
                >
                  <svg
                    width="46"
                    height="23"
                    viewBox="0 0 48 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_0_12px_rgba(96,165,250,0.95)]"
                  >
                    {/* Car Body */}
                    <path
                      d="M38 18H42C43.1 18 44 17.1 44 16V13C44 11.9 43.1 11 42 11H39.4L34.6 4.6C34.2 4 33.5 3.6 32.8 3.6H15.2C14.5 3.6 13.8 4 13.4 4.6L8.6 11H6C4.9 11 4 11.9 4 13V16C4 17.1 4.9 18 6 18H10"
                      fill="#0F172A"
                      stroke="#60A5FA"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Windows */}
                    <path d="M14 11H34L30.5 5.5H17.5L14 11Z" fill="#93C5FD" opacity="0.7" />
                    
                    {/* Spinning Wheels */}
                    <g transform="translate(14, 18)">
                      <circle cx="0" cy="0" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
                      <motion.line
                        x1="-2" y1="0" x2="2" y2="0"
                        stroke="#60A5FA" strokeWidth="1"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
                      />
                    </g>
                    
                    <g transform="translate(34, 18)">
                      <circle cx="0" cy="0" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
                      <motion.line
                        x1="-2" y1="0" x2="2" y2="0"
                        stroke="#60A5FA" strokeWidth="1"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
                      />
                    </g>

                    {/* Headlight Beam Glow */}
                    <polygon points="44,14 48,12 48,16" fill="#F59E0B" opacity="0.9" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Percentage Display */}
            <div className="mt-3">
              <span className="text-xl md:text-2xl font-black text-blue-400 tracking-wider drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                {Math.round(barWidth)}%
              </span>
            </div>

          </div>

          <div className="flex-1" />

          {/* Bottom Trust Badges (4 Columns) */}
          <div className="relative z-10 w-full max-w-4xl border-t border-white/10 pt-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-left">
              
              {/* Badge 1 */}
              <div className="flex items-center gap-3 md:border-r border-white/10 pr-4">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">SAFE & SECURE</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Trusted Care</p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="flex items-center gap-3 md:border-r border-white/10 pr-4">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">SPOTLESS CLEAN</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Perfect Shine</p>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="flex items-center gap-3 md:border-r border-white/10 pr-4">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">ON TIME</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Always Punctual</p>
                </div>
              </div>

              {/* Badge 4 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <Leaf size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">ECO FRIENDLY</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Green Cleaning</p>
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
