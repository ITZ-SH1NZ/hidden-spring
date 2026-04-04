"use client";

import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function LevelComplete() {
  const { setScene, setPlayerPos, setTimeRemaining, setLives } = useGame();

  const handleNextLevel = () => {
    // Reset player position for Level 2
    setPlayerPos({ x: 2, y: 2, dir: "down" });
    setTimeRemaining(120); // Reset timer for new level with more generous limit
    setLives(3); // Soft reset lives for new sector
    setScene("lore2"); 
  };

  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-6 z-[100] font-mono text-white">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full border border-easter-green/30 bg-easter-green/5 p-12 text-center brutal-border relative overflow-hidden shadow-[0_0_40px_rgba(50,205,50,0.1)]"
      >
        <div className="absolute top-0 right-0 p-2 text-xs text-easter-green/50">SYS.SUCCESS</div>

        <h1 className="text-3xl md:text-5xl font-black text-easter-green tracking-widest mb-6 uppercase drop-shadow-[0_0_10px_#32CD32]">
          SECTOR 1 CLEARED
        </h1>
        
        <p className="text-white/70 tracking-wide leading-relaxed mb-10 text-sm md:text-base">
          The correct Egg Sequence has been validated. <br/><br/>
          You have breached the outer rim of the Architect's Vault. <br/>
          WARNING: Combat modules offline. The inner sector relies on stealth detection protocols. Evade the red logic lasers at all costs.
        </p>

        <button 
          onClick={handleNextLevel}
          className="px-8 py-4 text-xl font-bold brutal-border border-easter-green text-easter-green hover:bg-easter-green hover:text-black transition-all tracking-widest"
        >
          INITIATE SECTOR 2
        </button>
      </motion.div>
    </div>
  );
}
