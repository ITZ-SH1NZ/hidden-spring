"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/ui/MagneticButton";

export default function ScrollHatch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topShellRef = useRef<HTMLDivElement>(null);
  const bottomShellRef = useRef<HTMLDivElement>(null);
  const crackRef = useRef<SVGPathElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const matchMedia = gsap.matchMedia();

    matchMedia.add("(min-width: 320px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center 55%", 
          end: "+=120%",       
          pin: true,
          scrub: 1,
        }
      });

      // 1. Wiggle + Show Crack
      tl.to([topShellRef.current, bottomShellRef.current], {
        rotate: 5, duration: 0.1, x: 2
      })
      .to(crackRef.current, { opacity: 1, duration: 0.1 }, "<")
      .to([topShellRef.current, bottomShellRef.current], {
        rotate: -5, duration: 0.1, x: -2
      })
      .to([topShellRef.current, bottomShellRef.current], {
        rotate: 0, duration: 0.1, x: 0
      });

      // 2. Crack / Separate Shells using HTML yPercent
      tl.to(topShellRef.current, {
        yPercent: -130, 
        rotate: -15,
        duration: 1,
        ease: "power2.inOut"
      }, "crack")
      .to(bottomShellRef.current, {
        yPercent: 90, 
        rotate: 15,
        duration: 1,
        ease: "power2.inOut"
      }, "crack")
      .to(raysRef.current, {
        opacity: 1,
        rotate: 180,
        scale: 1.5,
        duration: 1.5,
        ease: "power1.inOut"
      }, "crack")
      .to(crackRef.current, { opacity: 0, duration: 0.2 }, "crack");

      // 3. Emerge Content
      tl.fromTo(".hatch-item", 
        { y: 80, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.2, duration: 1, ease: "back.out(1.7)" },
        "crack+=0.2"
      );

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    });

    return () => matchMedia.revert();
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#FFF9D2] via-[#FFF9D2] to-[#B5F1B5] w-full border-y-[8px] border-black relative z-30">
      
      <section ref={containerRef} className="relative w-full h-[100svh] flex flex-col items-center justify-center overflow-hidden">
        
        <div className="relative w-full max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center">
          
          <div ref={raysRef} className="absolute inset-0 flex items-center justify-center opacity-0 scale-50 pointer-events-none z-0">
             <div className="w-[150vw] h-[150vw] md:w-[60vw] md:h-[60vw] bg-[repeating-conic-gradient(#FFB6C1_0_15deg,transparent_15deg_30deg)] rounded-full blur-[2px] opacity-20" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none w-full px-4 text-center">
             <div className="hatch-item">
                <h2 className="text-[clamp(3.5rem,8vw,6.5rem)] font-black leading-none mb-6 tracking-tighter text-easter-hotpink" style={{ WebkitTextStroke: "2px #1A1A1A", textShadow: "4px 4px 0 #1A1A1A" }}>
                  THE MYSTERY<br/>UNFOLDS
                </h2>
                 <div className="text-[clamp(1.25rem,2vw,1.6rem)] font-bold max-w-xl mx-auto text-gray-800 bg-white p-8 rounded-[40px] border-[4px] border-black brutal-shadow mb-8">
                  A perfect blend of high-end design joy and meticulous gamified exploration.
                </div>
                <div className="pointer-events-auto flex justify-center">
                  <MagneticButton onClick={() => router.push('/game')} color="pink" className="text-xl">
                    Enter The Spring
                  </MagneticButton>
                </div>
             </div>
          </div>

          <div className="absolute z-20 w-[65vw] max-w-[320px] aspect-[3/4] flex flex-col items-center justify-center drop-shadow-[20px_20px_0_#1A1A1A]">
            
            <div ref={topShellRef} className="relative w-full h-[55%] mb-[-5%] z-20 origin-bottom">
              <svg viewBox="0 0 200 140" className="w-full h-full overflow-visible">
                <path 
                  d="M 10 130 L 20 140 L 50 110 L 90 140 L 130 110 L 160 150 L 190 130 C 190 130 180 10 100 10 C 20 10 10 130 10 130 Z" 
                  fill="#FF69B4" stroke="#1A1A1A" strokeWidth="12" strokeLinejoin="round" 
                />
                <circle cx="60" cy="65" r="15" fill="#FFF" opacity="0.3" />
                {/* Crack Path */}
                <path 
                  ref={crackRef}
                  d="M 25 135 L 50 112 L 85 140 L 125 110 L 155 145"
                  fill="none" stroke="#1A1A1A" strokeWidth="8" strokeOpacity="0.8" className="opacity-0"
                />
              </svg>
            </div>

            <div ref={bottomShellRef} className="relative w-full h-[50%] z-10 origin-top">
              <svg viewBox="0 0 200 130" className="w-full h-full overflow-visible">
                <path 
                  d="M 10 20 L 20 30 L 50 0 L 90 30 L 130 0 L 160 40 L 190 20 C 190 20 190 120 100 120 C 10 120 10 20 10 20 Z" 
                  fill="#FF69B4" stroke="#1A1A1A" strokeWidth="12" strokeLinejoin="round" 
                />
                <ellipse cx="100" cy="115" rx="55" ry="10" fill="#000" opacity="0.15" />
              </svg>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
