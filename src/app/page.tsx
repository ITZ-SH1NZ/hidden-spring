"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroSection from "@/components/sections/HeroSection";
import HorizontalWorld from "@/components/sections/HorizontalWorld";
import FlashlightEgg from "@/components/sections/FlashlightEgg";
import ScrollHatch from "@/components/sections/ScrollHatch";
import PlayableGrid from "@/components/sections/PlayableGrid";
import Footer from "@/components/sections/Footer";

// Clean UI Icons
const PuzzleSVG = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.911-.292-1.252-.633a2.353 2.353 0 0 0-3.328 0c-.336.336-.56.77-.631 1.24-.035.234-.145.45-.306.611l-1.575 1.576c-.47.47-1.086.705-1.703.705-.618 0-1.234-.235-1.704-.705l-1.611-1.61a.972.972 0 0 1-.275-.838c.07-.47.291-.912.632-1.253a2.353 2.353 0 0 0 0-3.328c-.337-.336-.771-.56-1.241-.631a.975.975 0 0 1-.611-.306L3.618 8.857c-.47-.47-.705-1.086-.705-1.703 0-.618.235-1.234.705-1.704l1.611-1.611a.971.971 0 0 1 .837-.275c.47.07.912.291 1.252.632a2.353 2.353 0 0 0 3.328 0c.337-.336.56-.77.632-1.241.034-.235.144-.45.305-.611l1.575-1.576c.47-.47 1.086-.705 1.704-.705.617 0 1.233.235 1.703.705l1.611 1.611c.215.215.344.51.378.814.048.43.267.838.618 1.189A2.353 2.353 0 0 0 19.439 7.85z" /></svg>;
const PaletteSVG = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.838-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>;
const AudioSVG = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2C6.477 2 2 6.477 2 12v7a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4c0-4.418 3.582-8 8-8s8 3.582 8 8h-3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-7c0-5.523-4.477-10-10-10z" /></svg>;
const GiantBunnySVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-[#FFF] text-gray-900" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
    <path d="M30 40 C20 10, 40 0, 45 40 Z" />
    <path d="M70 40 C80 10, 60 0, 55 40 Z" />
    <ellipse cx="50" cy="65" rx="35" ry="30" />
    <circle cx="35" cy="60" r="5" fill="currentColor" stroke="none" />
    <circle cx="65" cy="60" r="5" fill="currentColor" stroke="none" />
    <ellipse cx="50" cy="70" rx="4" ry="3" fill="#FF69B4" stroke="none" />
  </svg>
);

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runIntro = () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(".nav-item",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
        );
      }, mainRef);
      return () => ctx.revert();
    };

    window.addEventListener('hiddenspring:loaded', runIntro, { once: true });
    return () => window.removeEventListener('hiddenspring:loaded', runIntro);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main ref={mainRef} className="bg-[#1A1A1A] w-full min-h-screen">
      
      {/* GLASSS NAV */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-[100] mix-blend-difference text-white pointer-events-none">
        <a href="#hero" onClick={(e) => handleScroll(e, '#hero')} className="nav-item flex items-center gap-3 font-black text-2xl tracking-tighter pointer-events-auto hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="" className="w-8 h-8 object-contain" />
          <span>HIDDEN SPRING</span>
        </a>
        <div className="nav-item hidden md:flex gap-8 font-bold uppercase tracking-widest text-sm pointer-events-auto">
          <a href="#about" onClick={(e) => handleScroll(e, '#about')} className="hover:opacity-50 transition-opacity">About</a>
          <a href="#explore" onClick={(e) => handleScroll(e, '#explore')} className="hover:opacity-50 transition-opacity">Explore</a>
          <a href="#play" onClick={(e) => handleScroll(e, '#play')} className="hover:opacity-50 transition-opacity">Play</a>
        </div>
        <div className="nav-item pointer-events-auto">
          <MagneticButton color="black" className="px-6 py-2 text-sm !border-2 !border-white/50 hover:!border-white transition-colors bg-black/80 backdrop-blur-md">Play Now</MagneticButton>
        </div>
      </nav>

      {/* --- GAMIFIED HERO --- */}
      <HeroSection />

      {/* --- SCROLL HATCH STORY --- */}
      <ScrollHatch />

      {/* --- BENTO GRID SECTION --- */}
      <section id="about" className="relative z-10 w-full bg-[#1A1A1A] py-20 md:py-32 px-4 md:px-12 text-white overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-easter-blue opacity-5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            
            {/* Bento 1: Large Intro */}
            <div className="md:col-span-8 bg-easter-yellow text-gray-900 rounded-[40px] p-8 md:p-16 flex flex-col justify-between min-h-[400px] border-4 border-black brutal-shadow transition-transform hover:-translate-y-2">
              <div>
                <span className="px-4 py-1 border-2 border-black rounded-full font-bold uppercase text-sm mb-6 inline-block">The Vision</span>
                <h2 className="text-[clamp(2rem,4vw,4rem)] font-black leading-[1.1] mb-6 max-w-2xl">
                  Not your average egg hunt. We brought pure design joy into gameplay.
                </h2>
              </div>
              <p className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold max-w-lg">
                Vibrant colors meet mind-bending puzzles in a lush, interactive spring world.
              </p>
            </div>

            {/* Bento 2: Image/Color Block */}
            <div className="md:col-span-4 bg-easter-pink rounded-[40px] p-10 min-h-[400px] flex items-center justify-center relative overflow-hidden group border-4 border-black brutal-shadow transition-transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              <div className="text-[12rem] filter drop-shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 ease-elastic origin-center">
                <GiantBunnySVG />
              </div>
            </div>

            {/* Sub Bentos */}
            {[
              { color: "bg-easter-blue", icon: <PuzzleSVG className="w-16 h-16" />, title: "Brain Teasers", desc: "Over 50 crafted levels." },
              { color: "bg-easter-purple", icon: <PaletteSVG className="w-16 h-16" />, title: "Hand-Drawn", desc: "Meticulously crafted sprites." },
              { color: "bg-easter-green", icon: <AudioSVG className="w-16 h-16" />, title: "Spatial Audio", desc: "Immense soundscapes." }
            ].map((card, idx) => (
              <div key={idx} className={`md:col-span-4 ${card.color} rounded-[40px] p-10 min-h-[300px] flex flex-col justify-end group border-4 border-black brutal-shadow transition-transform hover:-translate-y-2 text-gray-900`}>
                <div className="mb-auto group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-300 origin-bottom-left stroke-black stroke-[3px] text-white">
                  {card.icon}
                </div>
                <h3 className="text-[clamp(1.5rem,2vw,2rem)] font-black text-gray-900 mb-2 mt-8">{card.title}</h3>
                <p className="text-gray-900 font-bold">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HORIZONTAL EXPLORE --- */}
      <HorizontalWorld />

      {/* --- FLASHLIGHT INTERACTIVE --- */}
      <FlashlightEgg />

      {/* --- INFINITE MARQUEE --- */}
      <section className="relative w-full py-16 bg-easter-hotpink overflow-hidden z-10 flex text-[#1A1A1A] border-y-[8px] border-black">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
        >
          {Array(8).fill("PLAY BETA • EASTER 2026 • JUMP IN NOW • ").map((text, i) => (
            <span key={i} className="text-[clamp(3rem,6vw,6rem)] font-black mx-6 mt-2 tracking-tighter">
              {text}
            </span>
          ))}
        </motion.div>
      </section>

      {/* --- PLAYABLE MICRO-GAME WIDGET --- */}
      <PlayableGrid />

      {/* --- FOOTER CTA --- */}
      <section id="play" className="relative w-full min-h-screen bg-easter-yellow flex flex-col items-center justify-center text-center px-4 rounded-t-[60px] md:rounded-t-[100px] z-20 mt-[-40px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-[clamp(4rem,10vw,10rem)] font-black text-gray-900 leading-[0.9] mb-12 tracking-tighter text-outline-sm drop-shadow-[0_8px_0_#FF69B4]">
            HATCH IT.
          </h2>
          <MagneticButton color="pink" className="text-[clamp(1.5rem,3vw,3rem)] px-16 py-8 shadow-[8px_8px_0_0_#1A1A1A]">
            Play Beta
          </MagneticButton>
        </div>
      </section>

      <Footer />
      
      {/* Global Noise Applied via CSS */}
      <div className="noise-overlay" />
    </main>
  );
}
