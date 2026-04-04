"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const MiniEggSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-[#FFD700] stroke-black stroke-[3px]" strokeLinejoin="round">
    <path d="M50 5 C80 5 95 60 80 85 C65 105 35 105 20 85 C5 60 20 5 50 5 Z" />
    <ellipse cx="65" cy="35" rx="12" ry="18" fill="white" stroke="none" opacity="0.6" transform="rotate(30 65 35)" />
    <path d="M 20 60 Q 50 40 80 60" fill="none" stroke="black" strokeWidth="3" />
  </svg>
);
const MiniStarSVG = () => <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-current"><polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" stroke="black" strokeWidth="4" strokeLinejoin="round" /></svg>;
const MiniFlowerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-current" stroke="black" strokeWidth="4">
    <path d="M50 20 C60 0, 90 10, 80 40 C100 30, 100 70, 80 60 C90 90, 60 100, 50 80 C40 100, 10 90, 20 60 C0 70, 0 30, 20 40 C10 10, 40 0, 50 20 Z" />
    <circle cx="50" cy="50" r="10" fill="white" />
  </svg>
);

const ICONS = [MiniEggSVG, MiniStarSVG, MiniFlowerSVG, MiniStarSVG];

export default function FlashlightEgg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [meadowItems, setMeadowItems] = useState<{ id: number, x: number, y: number, scale: number, rotation: number, type: number, color: string }[]>([]);
  
  const mouseX = useSpring(0, { stiffness: 80, damping: 15 });
  const mouseY = useSpring(0, { stiffness: 80, damping: 15 });

  useEffect(() => {
    // Generate random items on client mount to avoid SSR hydration mismatch
    const items = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      type: i % ICONS.length,
      color: i % 3 === 0 ? "text-easter-hotpink" : i % 2 === 0 ? "text-easter-green" : "text-easter-blue"
    }));
    setMeadowItems(items);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseenter", () => setIsHovered(true));
      element.addEventListener("mouseleave", () => setIsHovered(false));
    }

    return () => {
      if (element) {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseenter", () => setIsHovered(true));
        element.removeEventListener("mouseleave", () => setIsHovered(false));
      }
    };
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-[120vh] bg-black overflow-hidden flex flex-col items-center justify-center cursor-crosshair border-y-[8px] border-[#1A1A1A] z-20"
    >
      {/* 2. Layered Flashlight Mask */}
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-700"
        style={{
          background: "black",
          opacity: isHovered ? 0.99 : 1,
        }}
      >
        {/* The "Inner" Light Hole */}
        <motion.div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[60px]"
          style={{
            x: mouseX,
            y: mouseY,
            translateX: "-50%",
            translateY: "-50%",
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)",
            mixBlendMode: "destination-out" as any
          }}
        />
        {/* The "Outer" Glow Ring */}
        <motion.div 
          className="absolute w-[550px] h-[550px] rounded-full blur-[100px] opacity-20"
          style={{
            x: mouseX,
            y: mouseY,
            translateX: "-50%",
            translateY: "-50%",
            background: "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 80%)",
          }}
        />
      </motion.div>

      {/* 1. Procedural Hidden Meadow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        {meadowItems.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <motion.div 
              key={item.id}
              className={`absolute text-2xl ${item.color}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                scale: item.scale,
                rotate: item.rotation
              }}
            >
              <Icon />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl text-center flex flex-col items-center relative z-40">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-[clamp(10rem,15vw,15rem)] leading-none mb-4 filter drop-shadow-[0_0_60px_#FFD700] hover:drop-shadow-[0_0_100px_#FFD700] transition-all duration-500 cursor-pointer"
          >
            <MiniEggSVG />
          </motion.div>
          
          <h2 className="text-[clamp(3.5rem,7vw,10rem)] font-black text-white text-outline tracking-tighter mb-4 mix-blend-overlay opacity-90">
            GOLDEN SECRETS
          </h2>
          
          <p className="text-[clamp(1.1rem,1.8vw,2.2rem)] text-white font-bold max-w-2xl bg-black/40 backdrop-blur-xl p-10 rounded-[40px] border-[3px] border-white/10 mb-12 brutal-shadow">
            Only the persistent find what hides in the shadows. Peer deeper through the darkness to uncover the true path of the Spring.
          </p>
          
          <div className="relative pointer-events-auto">
             <MagneticButton color="yellow" className="text-[clamp(1.5rem,3vw,3.5rem)] px-14 py-8 font-black tracking-widest !border-white">
               Start Digging
             </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

