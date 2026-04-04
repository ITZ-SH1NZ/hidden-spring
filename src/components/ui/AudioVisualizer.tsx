"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SpeakerIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <AnimatePresence>
      {!isPlaying && (
        <motion.line 
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
          x1="23" y1="1" x2="1" y2="23" stroke="#FF69B4" strokeWidth="4"
        />
      )}
    </AnimatePresence>
  </svg>
);

export default function AudioVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/music/Fun Background Music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 left-4 md:bottom-10 md:left-10 z-[80] pointer-events-none">
      
      {/* SVG Gooey Filter Definition */}
      <svg className="absolute w-0 h-0 invisible" aria-hidden="true">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <motion.div 
        className="relative flex items-center pointer-events-auto cursor-pointer rounded-full origin-left scale-[0.5] md:scale-100 translate-x-[-15%] md:translate-x-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={togglePlay}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Gooey Shapes Background */}
        <div style={{ filter: "url(#goo)" }} className="absolute inset-0 flex items-center pointer-events-none">
          {/* Main Circle Component */}
          <motion.div 
            className="w-14 h-14 bg-black rounded-full border-2 border-white/20" 
            layoutId="liquid-control"
          />
          {/* Stretching Pill Component */}
          <motion.div 
            className="h-14 bg-black rounded-full border-2 border-white/20 absolute left-0"
            animate={{ 
              width: isPlaying ? "clamp(9rem, 25vw, 11rem)" : "3.5rem",
              x: isPlaying ? 0 : 0,
              scale: isPlaying ? 1 : 0.8,
              opacity: isPlaying ? 1 : 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 18,
              opacity: { duration: 0.1 }
            }}
          />
        </div>

        {/* Crisp Content Layer */}
        <div className="relative flex items-center h-14 px-4 z-10 overflow-hidden">
          <div className="w-6 h-14 flex items-center justify-center shrink-0">
             <SpeakerIcon isPlaying={isPlaying} />
          </div>

          <AnimatePresence>
            {isPlaying && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
                className="flex items-center gap-[3px] ml-4 h-5"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-[3px] bg-easter-hotpink rounded-full origin-bottom"
                    animate={{
                      height: [4, 18, 8, 22, 10][i % 5],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 0.4 + (i * 0.15),
                      ease: "easeInOut"
                    }}
                    style={{ minHeight: "4px" }}
                  />
                ))}
                <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">LIVE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
