"use client";

import { useState, useEffect, useRef } from "react";
import { useGame } from "@/app/game/GameContext";
import { playSound } from "@/utils/sound";

interface Entity {
  id: number;
  x: number;
  y: number;
  speed: number;
  width: number;
  isStamper?: boolean;
}

export default function Level4Forge() {
  const { setScene, showDialog, loseLife, dialogInfo } = useGame();
  
  const [player, setPlayer] = useState({ x: 5, y: 10 });
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stampActive, setStampActive] = useState(false);
  const [flash, setFlash] = useState(false);

  const playerRef = useRef({ x: 5, y: 10 });
  const keys = useRef<{ [key: string]: boolean }>({});
  const lastMoveTime = useRef(0);
  const dialogActiveRef = useRef(false);
  
  useEffect(() => { dialogActiveRef.current = dialogInfo.show; }, [dialogInfo.show]);

  // Setup initial entities
  const initEntities = useRef<Entity[]>([]);
  const nextId = useRef(0);
  
  const spawnEntity = (y: number, speed: number, width: number = 1, isStamper = false) => {
     initEntities.current.push({
       id: nextId.current++,
       x: speed > 0 ? -width : 10,
       y,
       speed,
       width,
       isStamper
     });
  };

  const resetPosition = () => {
     setPlayer({ x: 5, y: 10 });
     playerRef.current = { x: 5, y: 10 };
     setFlash(true);
     setTimeout(() => setFlash(false), 200);
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    // Initial spawn
    if (initEntities.current.length === 0) {
      spawnEntity(1, 0.04, 2);
      spawnEntity(1, 0.04, 1);
      spawnEntity(3, -0.05, 2);
      spawnEntity(7, 0.08, 1);
      spawnEntity(8, -0.07, 2);
    }

    let animationId: number;
    let stampCounter = 0;

    const loop = (time: number) => {
      animationId = requestAnimationFrame(loop);
      
      if (dialogActiveRef.current) return;

      // Handle Stamper Row 5
      stampCounter++;
      if (stampCounter > 150) {
         setStampActive(true);
         if (stampCounter > 170) {
            setStampActive(false);
            stampCounter = 0;
         }
      }

      // Player Movement (Discrete grid)
      if (time - lastMoveTime.current > 150) {
         let dx = 0; let dy = 0;
         if (keys.current["ArrowUp"] || keys.current["KeyW"] || keys.current["w"]) dy = -1;
         else if (keys.current["ArrowDown"] || keys.current["KeyS"] || keys.current["s"]) dy = 1;
         else if (keys.current["ArrowLeft"] || keys.current["KeyA"] || keys.current["a"]) dx = -1;
         else if (keys.current["ArrowRight"] || keys.current["KeyD"] || keys.current["d"]) dx = 1;

         if (dx !== 0 || dy !== 0) {
            playerRef.current.x = Math.max(0, Math.min(9, playerRef.current.x + dx));
            playerRef.current.y = Math.max(0, Math.min(10, playerRef.current.y + dy));
            setPlayer({ ...playerRef.current });
            lastMoveTime.current = time;
            playSound("move");
         }
      }

      // Entity Movement & Spawn
      const rows = [1, 3, 7, 8];
      rows.forEach(r => {
         // Randomly spawn if row is sparse
         if (Math.random() < 0.015) {
            const speed = r === 1 ? 0.04 : r === 3 ? -0.05 : r === 7 ? 0.08 : -0.07;
            spawnEntity(r, speed, Math.random() > 0.5 ? 2 : 1);
         }
      });

      initEntities.current.forEach(e => {
         e.x += e.speed;
      });

      // Cleanup OOB
      initEntities.current = initEntities.current.filter(e => e.x > -3 && e.x < 13);
      setEntities([...initEntities.current]);

      // Collisions
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      
      // Hit Terminal?
      if (py === 0) {
         dialogActiveRef.current = true;
         playSound("collect");
         playSound("level_complete");
         showDialog("[ FACTORY OVERRIDE COMPLETE — ESCAPE! ]", "system");
         setTimeout(() => {
            setScene("lore5");
         }, 3000);
         return;
      }

      // Hit Stamper?
      if (py === 5 && stampActive) {
         playSound("hit");
         loseLife();
         showDialog("CRUSHED BY THE STAMPER. REFORMING.", "system");
         resetPosition();
         return;
      }

      // Hit Crate?
      let hit = false;
      initEntities.current.forEach(e => {
          if (e.y === py) {
             // Check bounding box intersection with forgiving margins
             if (px < e.x + e.width - 0.4 && px + 1 - 0.4 > e.x) {
                hit = true;
             }
          }
      });

      if (hit) {
         playSound("hit");
         loseLife();
         showDialog("PACKAGED INTO A GREY BOX. REFORMING.", "system");
         resetPosition();
      }
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className={`absolute inset-0 bg-[#050505] flex items-center justify-center font-mono ${flash ? 'bg-red-900 invert' : ''}`}>
       
       {/* Background Grid Container */}
       <div className="relative w-full aspect-square max-w-3xl max-h-full border-4 border-easter-purple/30 bg-[#0A0A0A] overflow-hidden">
          
          {/* Conveyor Backgrounds */}
          <div className="absolute top-[9.09%] left-0 w-full h-[9.09%] border-y border-dashed border-white/20 animate-pulse" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 18px, transparent 18px, transparent 36px)' }} />
          <div className="absolute top-[27.27%] left-0 w-full h-[9.09%] border-y border-dashed border-white/20 animate-pulse" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 18px, transparent 18px, transparent 36px)' }} />
          {/* Stamper zone — colour-drain press */}
          <div className="absolute top-[45.45%] left-0 w-full h-[9.09%] bg-easter-purple/10 border-y border-easter-purple/40 z-0 flex items-center justify-center gap-4 overflow-hidden">
             <div className="w-3 h-3 rounded-full bg-easter-purple/30" />
             <span className="text-easter-purple/40 text-xs tracking-[0.5em] uppercase">COLOUR DRAIN STAMPER</span>
             <div className="w-3 h-3 rounded-full bg-easter-purple/30" />
          </div>
          <div className="absolute top-[63.63%] left-0 w-full h-[9.09%] border-y border-dashed border-white/20 animate-pulse" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 18px, transparent 18px, transparent 36px)' }} />
          <div className="absolute top-[72.72%] left-0 w-full h-[9.09%] border-y border-dashed border-white/20 animate-pulse" style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 18px, transparent 18px, transparent 36px)' }} />

          {/* Colour Restore Terminal at Row 0 */}
          <div className="absolute top-0 left-0 w-full h-[9.09%] bg-easter-green/20 border-b-2 border-easter-green flex items-center justify-center gap-3">
             <div className="w-3 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-easter-green/60 border border-easter-green animate-pulse" />
             <span className="text-easter-green font-black tracking-widest text-sm animate-pulse">COLOUR RESTORE TERMINAL</span>
             <div className="w-3 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-easter-green/60 border border-easter-green animate-pulse" />
          </div>

          {/* Rendering Entities (grey drained eggs on conveyor) */}
          {entities.map(e => (
            <div
              key={e.id}
              className="absolute z-10 flex items-center justify-center gap-[4%]"
              style={{
                 left: `${e.x * 10}%`,
                 top: `${e.y * 9.09}%`,
                 width: `${e.width * 10}%`,
                 height: "9.09%"
              }}
            >
               {Array.from({ length: e.width }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[70%] border border-white/20 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                    style={{
                       width: `${90 / e.width}%`,
                       backgroundColor: '#2A2A2A',
                       borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    }}
                  />
               ))}
            </div>
          ))}

          {/* Stamper press overlay — slams down like a colour-drain press */}
          {stampActive && (
             <div className="absolute top-[45.45%] left-0 w-full h-[9.09%] z-40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'rgba(155,93,229,0.85)', boxShadow: '0 0 30px #9B5DE5, inset 0 -4px 0 rgba(0,0,0,0.4)' }}>
                <div className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full bg-black/40 border border-white/20" />
                   <span className="text-white/80 text-[10px] font-black tracking-[0.3em] uppercase">DRAINING COLOUR</span>
                   <div className="w-4 h-4 rounded-full bg-black/40 border border-white/20" />
                </div>
             </div>
          )}

          {/* Player */}
          <div 
             className="absolute z-50 transition-all duration-100 flex items-center justify-center"
             style={{
                left: `${player.x * 10}%`,
                top: `${player.y * 9.09}%`,
                width: "10%",
                height: "9.09%"
             }}
          >
             {/* Player Mascot */}
             <div className="relative w-[80%] h-[80%] bg-easter-green rounded-t-lg rounded-b-md drop-shadow-[0_0_10px_#32CD32] border border-white">
                 <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
             </div>
          </div>
       </div>
    </div>
  );
}
