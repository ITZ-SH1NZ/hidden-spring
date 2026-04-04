"use client";

import { useGame } from "../../app/game/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function GameHUD() {
  const { scene, eggs, gameClues, decryptedClueCount, timeRemaining, lives } = useGame();
  const router = useRouter();

  const totalCollected = eggs ? eggs.filter(Boolean).length : 0;
  const progress = (totalCollected / 5) * 100;

  if (scene === 'ending') return null;

  return (
    <div className="fixed inset-0 p-6 flex justify-between items-start z-[100] pointer-events-none mix-blend-difference text-white">
      
      {/* Left side: Terminal Log */}
      <div className="flex flex-col gap-1 font-mono text-sm font-bold uppercase tracking-widest pointer-events-auto">
        <span className="opacity-50">SPRING.ACTIVE // COLOUR_CARRIER</span>
        <span>WARREN: {scene === 'level2_stealth' ? 'THE HOLLOW WARREN' : scene === 'level3_runner' ? 'THE GREAT TUMBLE' : scene === 'level4_forge' ? 'THE FACTORY FLOOR' : scene === 'level5_boss' ? 'THE GREY THRONE' : 'THE HIDDEN GARDEN'}</span>
      </div>

      {scene === 'overworld' && (
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 max-w-xs xl:max-w-md pointer-events-auto mix-blend-normal z-[110]">
           {gameClues && gameClues.map((clue, idx) => {
             const isDecrypted = idx < decryptedClueCount;
             return (
               <div key={idx} className={`p-2 lg:p-3 text-[10px] md:text-xs font-mono brutal-border ${isDecrypted ? 'bg-[#050505]/95 border-easter-green text-easter-green shadow-[0_0_15px_rgba(50,205,50,0.3)]' : 'bg-black/60 border-white/10 text-white/30 blur-[1px]'}`}>
                 {isDecrypted ? `[REVEALED]: ${clue}` : `[SEALED] DEFEAT A GUARDIAN TO REVEAL`}
               </div>
             )
           })}
        </div>
      )}

      {/* Right side: Timer & Exit */}
      <div className="flex flex-col items-end gap-6 pointer-events-auto">
        {scene !== 'level_complete' && scene !== 'gameover' && (
           <div className="flex gap-6 pointer-events-none">
             <div className="flex flex-col items-center">
                <span className="font-mono text-xs text-white/50">TIME LIMIT</span>
                <span className={`font-mono text-3xl font-black ${timeRemaining <= 10 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                  {timeRemaining}s
                </span>
             </div>
             <div className="flex flex-col items-center">
                <span className="font-mono text-xs text-white/50">LIVES</span>
                <div className="flex gap-2 mt-1">
                  {[0,1,2].map(i => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-easter-green shadow-[0_0_10px_#32CD32]' : 'border border-white/20'}`} />
                  ))}
                </div>
             </div>
           </div>
        )}

        <button 
          onClick={() => router.push('/')}
          className="font-mono text-sm font-bold border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
        >
          // ESCAPE
        </button>
      </div>
      
    </div>
  );
}
