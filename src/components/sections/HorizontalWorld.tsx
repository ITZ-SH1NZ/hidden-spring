"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FlowerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-[#FF69B4]" stroke="black" strokeWidth="4" strokeLinejoin="round">
    <path d="M50 20 C60 0, 90 10, 80 40 C100 30, 100 70, 80 60 C90 90, 60 100, 50 80 C40 100, 10 90, 20 60 C0 70, 0 30, 20 40 C10 10, 40 0, 50 20 Z" />
    <circle cx="50" cy="50" r="15" fill="#FFF" stroke="black" strokeWidth="4" />
  </svg>
);

const BunnySVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-[#AEE2FF]" stroke="black" strokeWidth="4" strokeLinejoin="round">
    <path d="M30 40 C20 10, 40 0, 45 40 Z" />
    <path d="M70 40 C80 10, 60 0, 55 40 Z" />
    <ellipse cx="50" cy="65" rx="35" ry="30" />
    <circle cx="35" cy="60" r="5" fill="black" stroke="none" />
    <circle cx="65" cy="60" r="5" fill="black" stroke="none" />
    <ellipse cx="50" cy="70" rx="4" ry="3" fill="#FF69B4" stroke="none" />
  </svg>
);

const GemSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[1em] h-[1em] fill-white" stroke="black" strokeWidth="4" strokeLinejoin="round" strokeMiterlimit="2">
    <polygon points="50,10 90,30 50,90 10,30" fill="#E6E6FA" />
    <polygon points="50,10 90,30 50,50" fill="#FFF" />
    <polygon points="10,30 50,10 50,50" fill="#D8BFD8" />
    <polygon points="50,50 90,30 50,90" fill="#DDA0DD" />
  </svg>
);

export default function HorizontalWorld() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, opacity: number, speed: number }[]>([]);

  useEffect(() => {
    // Generate random particles on client mount to avoid SSR hydration mismatch
    const items = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 500, // Wide spread
      y: Math.random() * 100,
      size: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 1.5
    }));
    setParticles(items);

    if (!sectionRef.current || !wrapperRef.current) return;
    
    gsap.registerPlugin(ScrollTrigger);
    const matchMedia = gsap.matchMedia();

    matchMedia.add("(min-width: 0px)", () => {
      // Main horizontal animation
      const horizontalAnim = gsap.to(wrapperRef.current, {
        x: () => -(wrapperRef.current!.offsetWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: "center center",
          end: () => `+=${wrapperRef.current!.offsetWidth}`,
          scrub: 1,
        }
      });

      // Background "Sky" parallax
      gsap.to(skyRef.current, {
        x: () => -(wrapperRef.current!.offsetWidth * 0.3), // Moves 30% slower
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "center center",
          end: () => `+=${wrapperRef.current!.offsetWidth}`,
          scrub: 1,
        }
      });

      // Card Parallax elements
      gsap.utils.toArray('.parallax-icon').forEach((icon: any) => {
        gsap.to(icon, {
          x: 250,
          rotate: 60,
          ease: "none",
          scrollTrigger: {
            trigger: icon.parentElement,
            start: "left right", 
            end: "right left",
            scrub: true,
            containerAnimation: horizontalAnim
          }
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <section id="explore" ref={sectionRef} className="relative h-[100svh] w-full overflow-hidden bg-easter-green border-y-[8px] border-black z-10 block">
      
      {/* 1. Parallax Sky Layer */}
      <div ref={skyRef} className="absolute top-0 left-0 h-full w-[300vw] pointer-events-none opacity-40 z-0 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {particles.map((p: any) => (
          <div 
            key={p.id}
            className="absolute rounded-full border-2 border-black/10"
            style={{
              left: `${p.x}vw`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity
            }}
          />
        ))}
      </div>

      <div className="absolute top-10 left-6 md:left-10 z-20">
        <h2 className="text-[clamp(2rem,4vw,4rem)] font-black text-black text-outline-sm mix-blend-overlay opacity-40">SPRING EXPLORATION</h2>
      </div>

      <div ref={wrapperRef} className="absolute top-0 left-0 h-full flex flex-row items-center will-change-transform px-[5vw] overflow-visible z-10">
        
        {/* Card 1 */}
        <div className="w-[85vw] md:w-[65vw] h-[75vh] flex-shrink-0 bg-white rounded-[50px] md:rounded-[70px] border-[6px] md:border-[10px] border-black brutal-shadow p-10 md:p-20 mr-[8vw] md:mr-[12vw] flex flex-col justify-center relative overflow-hidden group">
          <div className="parallax-icon absolute -right-16 md:-right-24 -bottom-16 md:-bottom-24 text-[12rem] md:text-[24rem] opacity-20 group-hover:scale-110 transition-transform duration-1000">
            <FlowerSVG />
          </div>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h3 className="text-[clamp(3.5rem,7vw,9.5rem)] font-black leading-[0.85] mb-8 relative z-10 text-easter-hotpink drop-shadow-[5px_5px_0_#1A1A1A]">
              BLOOMING<br/>GARDENS
            </h3>
            <p className="text-[clamp(1.1rem,2.2vw,2.8rem)] font-bold max-w-xl leading-tight relative z-10 text-gray-800">
              Where geometric brutalism meets the untamed beauty of spring flora.
            </p>
          </motion.div>
        </div>

        {/* Card 2 */}
        <div className="w-[85vw] md:w-[65vw] h-[75vh] flex-shrink-0 bg-easter-yellow rounded-[50px] md:rounded-[70px] border-[6px] md:border-[10px] border-black brutal-shadow p-10 md:p-20 mr-[8vw] md:mr-[12vw] flex flex-col justify-center relative overflow-hidden group">
          <div className="parallax-icon absolute -right-10 md:-right-20 top-10 md:top-20 text-[12rem] md:text-[24rem] opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <BunnySVG />
          </div>
          <h3 className="text-[clamp(3.5rem,7vw,9.5rem)] font-black leading-[0.85] mb-8 relative z-10 text-easter-blue drop-shadow-[5px_5px_0_#1A1A1A]">
            BUNNY<br/>HOLLOW
          </h3>
          <p className="text-[clamp(1.1rem,2.2vw,2.8rem)] font-bold max-w-xl leading-tight relative z-10 text-gray-800">
            The beating heart of the mystery. Watch for shifting shadows in the grass.
          </p>
        </div>

        {/* Card 3 */}
        <div className="w-[85vw] md:w-[65vw] h-[75vh] flex-shrink-0 bg-easter-purple rounded-[50px] md:rounded-[70px] border-[6px] md:border-[10px] border-black brutal-shadow p-10 md:p-20 mr-[8vw] md:mr-[12vw] flex flex-col justify-center relative overflow-hidden group">
          <div className="parallax-icon absolute -left-12 md:-left-24 bottom-4 md:bottom-12 text-[12rem] md:text-[24rem] opacity-20 -rotate-12 group-hover:rotate-12 transition-transform duration-1000">
            <GemSVG />
          </div>
          <h3 className="text-[clamp(3.5rem,7vw,9.5rem)] font-black leading-[0.85] mb-8 relative z-10 text-white drop-shadow-[5px_5px_0_#1A1A1A]">
            CRYSTAL<br/>CAVE
          </h3>
          <p className="text-[clamp(1.1rem,2.2vw,2.8rem)] font-bold max-w-xl leading-tight relative z-10 text-easter-lightpink">
            The fragments of the first egg are scattered here. Can you piece it together?
          </p>
        </div>

      </div>
    </section>
  );
}
