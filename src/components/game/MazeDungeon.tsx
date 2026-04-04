"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

const TILE = 40;

// 1 = Wall, 0 = Path, 2 = Goal (Egg), 3 = Horizontal Laser, 4 = Vertical Laser
const MAZE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,3,0,0,0,1,0,0,0,2,1],
  [1,0,1,0,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,4,1,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,3,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,1,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,0,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,4,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const ROWS = MAZE_MAP.length;
const COLS = MAZE_MAP[0].length;

export default function MazeDungeon() {
  const { setScene, collectEgg, showDialog, takeDamage } = useGame();
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [laserTick, setLaserTick] = useState(false);

  // Laser toggles every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLaserTick(prev => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    let dx = 0; let dy = 0;
    if (e.key === "w" || e.key === "ArrowUp") dy = -1;
    if (e.key === "s" || e.key === "ArrowDown") dy = 1;
    if (e.key === "a" || e.key === "ArrowLeft") dx = -1;
    if (e.key === "d" || e.key === "ArrowRight") dx = 1;

    if (dx !== 0 || dy !== 0) {
      const nx = pos.x + dx;
      const ny = pos.y + dy;

      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
        const targetTile = MAZE_MAP[ny][nx];
        if (targetTile !== 1) {
           setPos({ x: nx, y: ny });
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pos]);

  // Check Death or Victory
  useEffect(() => {
    const tile = MAZE_MAP[pos.y][pos.x];
    if (tile === 2) {
      // Victory
      collectEgg(4); // Give the 5th egg
      showDialog("VAULT COMPROMISED. EGG RETRIEVED.");
      setScene("overworld");
    } else if (tile === 3 || tile === 4) {
      // If laser is active (laserTick = true), you die.
      if (laserTick) {
         takeDamage(20);
         showDialog("LASER TRIPWIRE TRIGGERED. RESETTING.", "system");
         setPos({ x: 1, y: 1 }); // Reset back to start
      }
    }
  }, [pos, laserTick, collectEgg, setScene, showDialog, takeDamage]);

  return (
    <motion.div 
      className="absolute inset-0 bg-[#020202] flex items-center justify-center font-mono"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute top-10 text-white/50 tracking-widest text-sm">
         [ SECURITY VAULT: EVADE ACTIVE LASERS ]
      </div>

      <div 
        className="relative bg-[#050505] border-4 border-white/20 brutal-shadow overflow-hidden"
        style={{ width: COLS * TILE, height: ROWS * TILE }}
      >
         {/* Render Map */}
         {MAZE_MAP.map((row, r) => (
           row.map((tile, c) => {
             // Wall
             if (tile === 1) {
               return (
                 <div key={`${r}-${c}`} className="absolute bg-[#1A1A1A] border-t border-l border-white/10" style={{ left: c*TILE, top: r*TILE, width: TILE, height: TILE }} />
               );
             }
             // Laser
             if (tile === 3 || tile === 4) {
               const isActive = laserTick;
               return (
                 <div key={`${r}-${c}`} className="absolute flex items-center justify-center" style={{ left: c*TILE, top: r*TILE, width: TILE, height: TILE }}>
                    <div className={`w-full h-full bg-red-500/10 transition-colors ${isActive ? 'bg-[#FF0044]' : 'bg-transparent'}`}>
                       {isActive && <div className={`absolute ${tile===3 ? 'w-full h-1 left-0 top-1/2' : 'h-full w-1 top-0 left-1/2'} bg-white drop-shadow-[0_0_10px_#FF0044]`} />}
                    </div>
                 </div>
               );
             }
             // Goal
             if (tile === 2) {
               return (
                 <div key={`${r}-${c}`} className="absolute flex items-center justify-center" style={{ left: c*TILE, top: r*TILE, width: TILE, height: TILE }}>
                    <div className="w-6 h-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-easter-purple brutal-border drop-shadow-[0_0_15px_#9B5DE5] animate-pulse" />
                 </div>
               )
             }
             return null;
           })
         ))}

         {/* Render Player Sprite */}
         <div 
           className="absolute z-20 transition-all duration-100 ease-linear flex items-center justify-center pointer-events-none"
           style={{ left: pos.x * TILE, top: pos.y * TILE, width: TILE, height: TILE }}
         >
           <div className="w-5 h-5 bg-easter-hotpink drop-shadow-[0_0_10px_#FF69B4] rotate-45 brutal-border border-white" />
         </div>

      </div>
    </motion.div>
  );
}
