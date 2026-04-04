"use client";

import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function GameOverScreen() {
  const { setScene } = useGame();

  const handleRestart = () => {
    // Rely on GameContext wipe on next mount or do it directly
    localStorage.removeItem("easterBugSave");
    setScene("lore");
    // Hard refresh to truly reset everything cleanly including unmounted context states
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-6 z-[100] font-mono">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF0044 25%, transparent 25%, transparent 75%, #FF0044 75%, #FF0044), repeating-linear-gradient(45deg, #FF0044 25%, #000 25%, #000 75%, #FF0044 75%, #FF0044)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="max-w-xl w-full bg-[#050505] brutal-border border-[#FF0044] p-8 md:p-12 text-center relative z-10 shadow-[0_0_50px_rgba(255,0,68,0.5)]"
      >
        <h1 className="text-4xl md:text-6xl font-black text-[#FF0044] tracking-widest mb-4 uppercase mix-blend-screen drop-shadow-[0_0_10px_#FF0044]">
          SPRING EXTINGUISHED
        </h1>
        <div className="text-white/60 text-sm md:text-lg mb-10 tracking-widest uppercase">
          The Grey King has drained your colour... for now.
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-4 text-xl font-bold brutal-border border-white hover:bg-[#FF0044] hover:text-black hover:border-[#FF0044] transition-all tracking-widest group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          HATCH AGAIN
        </button>
      </motion.div>
    </div>
  );
}
