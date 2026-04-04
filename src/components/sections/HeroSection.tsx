"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

// Simple Inline SVGs replacing Emojis
const FlowerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] text-white fill-current" stroke="black" strokeWidth="4" strokeLinejoin="round">
    <path d="M50 20 C60 0, 90 10, 80 40 C100 30, 100 70, 80 60 C90 90, 60 100, 50 80 C40 100, 10 90, 20 60 C0 70, 0 30, 20 40 C10 10, 40 0, 50 20 Z" />
    <circle cx="50" cy="50" r="15" fill="#FFD700" stroke="black" strokeWidth="4" />
  </svg>
);

const BunnySVG = () => (
  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] text-gray-800 fill-current" stroke="black" strokeWidth="4" strokeLinejoin="round">
    {/* Ears */}
    <path d="M30 40 C20 10, 40 0, 45 40 Z" fill="#FFF" />
    <path d="M70 40 C80 10, 60 0, 55 40 Z" fill="#FFF" />
    <path d="M35 38 C30 20, 38 15, 42 38 Z" fill="#FFB6C1" stroke="none" />
    <path d="M65 38 C70 20, 62 15, 58 38 Z" fill="#FFB6C1" stroke="none" />
    {/* Head */}
    <ellipse cx="50" cy="65" rx="35" ry="30" fill="#FFF" />
    {/* Eyes */}
    <circle cx="35" cy="60" r="4" fill="black" stroke="none" />
    <circle cx="65" cy="60" r="4" fill="black" stroke="none" />
    {/* Nose */}
    <ellipse cx="50" cy="70" rx="3" ry="2" fill="#FFB6C1" stroke="none" />
  </svg>
);

const ButterflySVG = () => (
  <svg viewBox="0 0 100 100" className="w-[100%] h-[100%] fill-easter-yellow stroke-black stroke-[3px]" strokeLinejoin="round">
    <path d="M50 50 C20 10 0 40 40 60 C0 80 20 100 50 60 Z" />
    <path d="M50 50 C80 10 100 40 60 60 C100 80 80 100 50 60 Z" />
    <ellipse cx="50" cy="55" rx="4" ry="15" fill="black" />
  </svg>
);

const CarrotSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[100%] h-[100%] drop-shadow-md">
    <path d="M 20 30 Q 30 10 50 20 Q 20 10 30 40 Z" fill="#22c55e" stroke="black" strokeWidth="3" />
    <path d="M 40 30 Q 50 5 60 20 Q 35 5 45 40 Z" fill="#16a34a" stroke="black" strokeWidth="3" />
    <path d="M 40 30 L 60 85 C 60 95 40 95 40 85 Z" fill="#f97316" stroke="black" strokeWidth="4" />
  </svg>
);

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [pageReady, setPageReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onLoaded = () => setPageReady(true);
    window.addEventListener('hiddenspring:loaded', onLoaded);
    return () => window.removeEventListener('hiddenspring:loaded', onLoaded);
  }, []);
  
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  
  const backHillsY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const midHillsY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const frontHillsY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // New dense parallax layers
  const floatUpY = useTransform(scrollYProgress, [0, 1], ["0%", "-150%"]);
  const floatDownFastY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 1.0 } }
  };

  const charVars = {
    hidden: { y: 150, opacity: 0, rotate: 15 },
    show: { y: 0, opacity: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 100, damping: 10 } }
  };

  return (
    <section id="hero" ref={heroRef} className="relative h-[110vh] w-full bg-easter-blue rounded-b-[40px] md:rounded-b-[80px] overflow-hidden flex items-center justify-center z-10 isolate">
      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#AEE2FF] via-[#FFE4E1] to-[#FFF9D2] z-0" />

      {/* Sun / Background Egg */}
      <motion.div 
        style={{ y: sunY }} 
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] md:w-[40vw] aspect-square rounded-full bg-gradient-to-br from-white to-easter-yellow opacity-90 blur-[60px] z-10"
      />

      {/* DENSE PARALLAX: Butterflies (Hidden on Mobile to save space) */}
      <motion.div style={{ y: floatUpY }} className="absolute top-[30%] left-[80%] w-24 h-24 z-20 hidden md:block opacity-60 mix-blend-multiply">
        <ButterflySVG />
      </motion.div>
      <motion.div style={{ y: floatUpY }} className="absolute top-[50%] left-[10%] w-16 h-16 z-20 hidden md:block opacity-40 mix-blend-multiply" animate={{ rotate: -15 }}>
        <ButterflySVG />
      </motion.div>

      {/* Gamified Background Hills */}
      <motion.div 
        className="absolute bottom-[-20%] md:bottom-[-40%] left-[-10%] w-[120%] h-[50vh] rounded-t-[100%] border-t-[8px] border-black z-20"
        style={{ y: backHillsY, backgroundColor: '#FFA8CC' }}
      />

      {/* DENSE PARALLAX: Carrot stuck in the back hill */}
      <motion.div style={{ y: backHillsY }} className="absolute bottom-[20%] right-[30%] w-20 h-20 z-[25] rotate-[-20deg]">
        <CarrotSVG />
      </motion.div>

      <motion.div 
        className="absolute bottom-[-25%] md:bottom-[-45%] right-[-20%] w-[80%] h-[60vh] rounded-t-[100%] border-t-[8px] border-black z-30"
        style={{ y: midHillsY, backgroundColor: '#C9A8FF' }}
      />
      <motion.div 
        className="absolute bottom-[-10%] md:bottom-[-30%] left-[-20%] w-[140%] h-[40vh] rounded-t-[50%] border-t-[8px] border-black z-40"
        style={{ y: frontHillsY, backgroundColor: '#7DD56F' }}
      />

      {/* Interactive Cursor-Dodging Foreground Elements */}
      <motion.div 
        style={{ y: floatDownFastY }}
        drag dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
        whileHover={{ scale: 1.2, rotate: 90, x: 50, y: -50 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        className="absolute top-[20%] md:top-[30%] left-[5%] md:left-[10%] w-[clamp(5rem,12vw,10rem)] aspect-[4/5] bg-easter-hotpink rounded-[50%_50%_50%_50%/60%_60%_40%_40%] brutal-border drop-shadow-[8px_8px_0_#1A1A1A] cursor-grab active:cursor-grabbing z-50 flex items-center justify-center p-2"
      >
        <FlowerSVG />
      </motion.div>

      <motion.div 
        style={{ y: floatDownFastY }}
        whileHover={{ scale: 0.8, x: -50, y: -50, rotate: -45 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute top-[70%] md:top-[50%] right-[5%] md:right-[15%] w-[clamp(6rem,14vw,12rem)] aspect-[3/4] bg-white rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-[4px] md:border-[8px] border-black border-dashed drop-shadow-[8px_8px_0_#1A1A1A] z-50 flex items-center justify-center"
      >
        <BunnySVG />
      </motion.div>

      {/* Main Responsive Typography */}
      <motion.div style={{ y: textY, opacity }} className="text-center z-[60] w-full px-4 flex flex-col items-center mt-[-5vh] mix-blend-normal pointer-events-auto">
        
        <div className="mb-6 px-6 py-2 bg-black text-white rounded-full font-bold uppercase tracking-[0.2em] text-xs md:text-sm border-2 border-white drop-shadow-[4px_4px_0_rgba(255,105,180,1)]">
          BETA V1.0 - SPRING 2026
        </div>

        <div className="relative mb-8 w-full max-w-[100vw] overflow-visible">
          {/* Main Animated Title */}
          <motion.h1 
            variants={containerVars} initial="hidden" animate={pageReady ? "show" : "hidden"}
            className="text-[clamp(3.5rem,14vw,14rem)] font-black leading-[0.8] tracking-tighter text-white relative z-50 py-4 drop-shadow-[0_8px_0_rgba(0,0,0,0.2)] flex flex-wrap justify-center"
          >
            {"HIDDEN".split("").map((c, i) => <motion.span variants={charVars} key={i} className="inline-block text-outline-sm md:text-outline">{c}</motion.span>)}
            <div className="w-full h-0"></div>
            {"SPRING".split("").map((c, i) => <motion.span variants={charVars} key={i} className="inline-block text-outline-sm md:text-outline">{c}</motion.span>)}
          </motion.h1>
          
          {/* 3D Static Shadows */}
          <h1 className="absolute top-[4px] md:top-[8px] left-0 w-full text-center text-[clamp(3.5rem,14vw,14rem)] font-black leading-[0.8] tracking-tighter text-easter-hotpink z-40 py-4 text-outline-sm md:text-outline pointer-events-none">
            HIDDEN<br/>SPRING
          </h1>
          <h1 className="absolute top-[8px] md:top-[16px] left-0 w-full text-center text-[clamp(3.5rem,14vw,14rem)] font-black leading-[0.8] tracking-tighter text-black z-30 py-4 pointer-events-none">
            HIDDEN<br/>SPRING
          </h1>
        </div>

        <p className="text-[clamp(1rem,2vw,1.5rem)] font-bold text-gray-900 max-w-sm md:max-w-2xl mx-auto mb-10 leading-snug bg-white/90 backdrop-blur-md px-6 py-4 rounded-[30px] border-4 border-black brutal-shadow">
          A Gamified Exploration wrapped in lush pastel colors.
        </p>

        <div className="flex gap-4">
          <MagneticButton onClick={() => router.push('/game')} color="black" className="text-[clamp(1rem,1.5vw,2rem)] px-8 py-4 !border-[3px] !border-white">Start The Hunt</MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}
