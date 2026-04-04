"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingScreenProps {
  onComplete?: () => void;
  messages?: string[];
}

export default function LoadingScreen({ onComplete, messages }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const statusMessages = messages ?? [
    "Waking the bunny...",
    "Painting the eggs...",
    "Hiding the tokens...",
    "Planting the spring...",
    "Almost there...",
  ];

  useEffect(() => {
    setStatusText(statusMessages[0]);
    const duration = 2800;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const raw = step / steps;
      const eased = raw < 0.7 ? raw * 1.2 : 0.84 + (raw - 0.7) * 0.53;
      const p = Math.min(eased * 100, 100);
      setProgress(p);

      const msgIndex = Math.min(Math.floor((p / 100) * statusMessages.length), statusMessages.length - 1);
      setStatusText(statusMessages[msgIndex]);

      if (step >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) {
            // Navigate immediately — exit animation plays during the route transition
            onComplete();
          } else {
            // Default: signal landing page components after the wipe-up finishes
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('hiddenspring:loaded'));
            }, 1050);
          }
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#1A1A1A]"
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Subtle noise texture layer */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
            }}
          />

          {/* Top-left tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="absolute top-8 left-8 font-black text-xs uppercase tracking-[0.4em] text-white/40"
          >
            Hidden Spring × Beta
          </motion.div>

          {/* Top-right version */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="absolute top-8 right-8 w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center font-black text-xs text-white/40"
          >
            v1
          </motion.div>

          {/* Logo & Giant Title */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center mb-2 flex flex-col items-center gap-6"
          >
            <motion.img 
              src="/logo.svg" 
              alt="Hidden Spring Logo"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
            <div className="text-[clamp(5rem,18vw,15rem)] font-black leading-[0.82] tracking-tighter text-white"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}
            >
              <span style={{ color: "#FF69B4" }}>H</span>IDDEN
              <br />
              <span style={{ color: "#AEE2FF" }}>S</span>PRING
            </div>
          </motion.div>

          {/* The rabbit — walks in from left */}
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 80, damping: 18 }}
            className="relative z-20 w-[180px] md:w-[240px] h-[130px] md:h-[170px]"
          >
            <DotLottieReact
              src="https://lottie.host/dc426f91-dc92-4140-8891-489ca2785bbc/F2ObwzuvMB.lottie"
              loop
              autoplay
            />
          </motion.div>

          {/* Bottom section: status + thin progress line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-10 left-0 right-0 px-10 md:px-20 z-20"
          >
            {/* Status text row */}
            <div className="flex justify-between items-center mb-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusText}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-white/50"
                >
                  {statusText}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs font-black tabular-nums text-white/50 tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Thin progress bar */}
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF69B4] via-white to-[#AEE2FF]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>

          {/* Corner accent squares */}
          <div className="absolute bottom-10 left-10 w-2 h-2 bg-[#FF69B4]" />
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-[#AEE2FF]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

