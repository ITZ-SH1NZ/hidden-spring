"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function EndingScreen() {
  const { lives } = useGame();

  const handleReset = () => {
    localStorage.removeItem("easterBugSave");
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-8 font-mono text-center z-50 overflow-hidden">
      
      {/* Background Matrix Rain / Shatter Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(50,205,50,0.15)_0%,transparent_70%)] animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-easter-green opacity-50 shadow-[0_0_20px_#32CD32] animate-bounce" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-easter-green opacity-50 shadow-[0_0_20px_#32CD32] animate-bounce" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl border-4 border-easter-green p-12 bg-black/80 brutal-shadow backdrop-blur-sm"
      >
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 2, duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
            Spring <span className="text-easter-green">Has Come</span>
          </h1>
          <h2 className="text-xl md:text-2xl text-easter-purple font-bold tracking-[0.5em] mb-12">
            THE EASTER BUG HAS WON.
          </h2>
        </motion.div>

         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 3.5, duration: 1 }}
           className="space-y-6 text-left max-w-lg mx-auto border border-white/20 p-6 bg-white/5 relative"
         >
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-easter-purple mt-[-4px] mr-[-4px]" />
           <div className="text-white/50 text-xs tracking-[0.2em] mb-4 text-center">SYSTEM REPORT</div>
           <h2 className="text-xl md:text-2xl text-easter-green font-black tracking-widest uppercase mb-2 text-center">5/5 Warrens Cleared</h2>

           <div className="flex justify-between border-b border-white/10 pb-2 mt-6">
             <span className="text-white/50">THE GREY KING&apos;S HOLD:</span>
             <span className="text-red-500 font-black">BROKEN</span>
           </div>

           <div className="flex justify-between border-b border-white/10 pb-2">
             <span className="text-white/50">LIVES RETAINED:</span>
             <span className="text-easter-green font-black">{lives} / 3</span>
           </div>

           <div className="flex justify-between">
             <span className="text-white/50">SPRING STATUS:</span>
             <span className="text-easter-hotpink font-black animate-pulse">FULLY HATCHED</span>
           </div>
         </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 5.5, duration: 1 }}
           className="mt-16"
        >
           <p className="text-xs text-white/50 mb-6 tracking-widest max-w-md mx-auto leading-relaxed">
             The fortress crumbles. Grey gives way to pink, green, gold. Every egg cracks open at once. Spring floods the world — and it&apos;s all because of you.
           </p>

           <button 
             onClick={handleReset}
             className="px-8 py-4 bg-transparent border-2 border-white text-white font-black tracking-widest text-lg hover:bg-white hover:text-black transition-colors brutal-shadow"
           >
             HARD CACHE RESET [PLAY AGAIN]
           </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
