"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";

const GithubIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const LinkedinIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const DiscordIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>;

// Custom Uploaded Reddit SVG (viewBox 0 0 20 20)
const RedditLogo = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10">
    <path d="M18 10.1c0-1-.8-1.8-1.8-1.7-.4 0-.9.2-1.2.5-1.4-.9-3-1.5-4.7-1.5l.8-3.8 2.6.6c0 .7.6 1.2 1.3 1.2.7 0 1.2-.6 1.2-1.3 0-.7-.6-1.2-1.3-1.2-.5 0-.9.3-1.1.7L11 2.9h-.2c-.1 0-.1.1-.1.2l-1 4.3C8 7.4 6.4 7.9 5 8.9c-.7-.7-1.8-.7-2.5 0s-.7 1.8 0 2.5c.1.1.3.3.5.3v.5c0 2.7 3.1 4.9 7 4.9s7-2.2 7-4.9v-.5c.6-.3 1-.9 1-1.6zM6 11.4c0-.7.6-1.2 1.2-1.2.7 0 1.2.6 1.2 1.2s-.6 1.2-1.2 1.2c-.7 0-1.2-.5-1.2-1.2zm7 3.3c-.9.6-1.9 1-3 .9-1.1 0-2.1-.3-3-.9-.1-.1-.1-.3 0-.5.1-.1.3-.1.4 0 .7.5 1.6.8 2.5.7.9.1 1.8-.2 2.5-.7.1-.1.3-.1.5 0s.2.3.1.5zm-.3-2.1c-.7 0-1.2-.6-1.2-1.2s.6-1.2 1.2-1.2c.7 0 1.2.6 1.2 1.2.1.7-.5 1.2-1.2 1.2z"/>
  </svg>
);

const EggSocial = ({ href, children, color }: { href: string; children: React.ReactNode; color: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
    whileTap={{ scale: 0.9 }}
    className={`relative w-16 h-20 md:w-24 md:h-28 ${color} rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-4 border-black brutal-shadow flex items-center justify-center text-black z-10 transition-transform`}
  >
    <div className="scale-125">{children}</div>
    {/* Decorative Egg Spots */}
    <div className="absolute top-4 left-4 w-2 h-3 bg-black/10 rounded-full" />
    <div className="absolute bottom-6 right-6 w-3 h-2 bg-black/10 rounded-full" />
  </motion.a>
);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight);
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (footerRef.current) {
      setHeight(footerRef.current.offsetHeight);
      const ro = new ResizeObserver(() => {
        if (footerRef.current) {
          setHeight(footerRef.current.offsetHeight);
        }
      });
      ro.observe(footerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  const isSticky = height > 0 && windowHeight > 0 && height <= windowHeight;

  return (
    <div style={{ height: isSticky ? height : 'auto' }} className="relative w-full z-0 bg-[#1A1A1A]">
      <footer ref={footerRef} className={`${isSticky ? 'fixed bottom-0' : 'relative'} left-0 w-full bg-[#1A1A1A] text-white pt-16 pb-12 px-6 md:px-12 overflow-hidden pointer-events-auto`}>
      
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
        
        {/* Top Segment: Title and Socials */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
             <img src="/logo.svg" alt="Hidden Spring Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain mb-6" />
             <h2 className="text-[clamp(3.5rem,6vw,6rem)] font-black leading-none mb-8 text-white text-outline-sm md:text-outline-sm drop-shadow-[8px_8px_0_#FF69B4] tracking-tighter">
               HIDDEN SPRING
             </h2>
             <div className="flex flex-wrap gap-x-12 gap-y-6 font-black uppercase tracking-widest text-base text-gray-400">
               <a 
                 href="#about" 
                 onClick={(e) => {
                   e.preventDefault();
                   document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="hover:text-easter-hotpink transition-colors"
               >
                 About
               </a>
               <a 
                 href="#explore" 
                 onClick={(e) => {
                   e.preventDefault();
                   document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="hover:text-easter-blue transition-colors"
               >
                 Explore
               </a>
               <a 
                 href="#play" 
                 onClick={(e) => {
                   e.preventDefault();
                   document.querySelector('#play')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="hover:text-easter-yellow transition-colors"
               >
                 Play
               </a>
             </div>
          </div>
          <div className="md:col-span-5 flex justify-start md:justify-end">
            <div className="flex gap-4 md:gap-6">
              <EggSocial href="https://github.com/ITZ-SH1NZ" color="bg-easter-blue"><GithubIcon /></EggSocial>
              <EggSocial href="https://www.instagram.com/itz_sh1nz/" color="bg-easter-hotpink"><InstagramIcon /></EggSocial>
              <EggSocial href="https://www.linkedin.com/in/tejas-km-73436237b/" color="bg-easter-lightpink"><LinkedinIcon /></EggSocial>
              <EggSocial href="https://www.reddit.com/user/OkStudent3946" color="bg-easter-yellow"><RedditLogo /></EggSocial>
              <EggSocial href="https://discord.gg/QWATFt6H" color="bg-easter-purple"><DiscordIcon /></EggSocial>
            </div>
          </div>
        </div>

        {/* Bottom Segment: Call-to-Action Buttons Alignment Row */}
        <div className="flex flex-col md:flex-row justify-between items-baseline md:items-end gap-12 pt-12 border-t border-white/5">
          <div className="relative group inline-block">
             <div className="absolute inset-0 bg-easter-green translate-x-1.5 translate-y-1.5 rounded-xl -z-10 group-hover:translate-x-2.5 group-hover:translate-y-2.5 transition-transform duration-300" />
             <div className="absolute inset-0 bg-easter-hotpink -translate-x-1.5 -translate-y-1.5 rounded-xl -z-20 group-hover:-translate-x-2.5 group-hover:-translate-y-2.5 transition-transform duration-300" />
             <a 
               href="https://tejaskm-dev.vercel.app" 
               target="_blank" 
               rel="noopener noreferrer"
               className="block px-12 py-6 bg-white text-black font-black text-2xl border-[5px] border-black brutal-shadow-sm rounded-xl uppercase tracking-tighter transition-all hover:bg-[#F0F0F0]"
             >
               Made by <span className="text-easter-hotpink">Tejas KM</span>
             </a>
          </div>

          <div className="relative z-50">
            <MagneticButton 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              color="yellow" 
              className="px-12 py-6 text-2xl font-black uppercase tracking-widest !border-white shadow-[6px_6px_0_0_#FFF] pointer-events-auto cursor-pointer"
            >
               Back to Top
            </MagneticButton>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] opacity-60">
           © 2026 • Crafted with Lush Pastel Passion
        </p>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-40">
           <span>Privacy Poly</span>
           <span>Terms of Serv</span>
        </div>
      </div>
      <div className="noise-overlay pointer-events-none" />
    </footer>
    </div>
  );
}
