"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

// 0=Floor, 1=Wall, 7=Bush(Hide), 8=Terminal(Objective), 9=Exit(Door)
const LEVEL2_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 8, 1, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 8, 0, 1],
  [1, 0, 7, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 7, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 7, 0, 1, 0, 1, 7, 0, 1, 0, 1, 1, 0, 1, 8, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 9, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 8, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1, 0, 1, 7, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const MAP_HEIGHT = LEVEL2_MAP.length;
const MAP_WIDTH = LEVEL2_MAP[0].length;

type Dir = "up" | "down" | "left" | "right";
interface Drone {
  id: string;
  x: number;
  y: number;
  dir: Dir;
  patrolRoute: Dir[];
  patrolIndex: number;
}

export default function Level2Stealth() {
  const { playerPos, setPlayerPos, setScene, showDialog, loseLife, lives, setLives, setTimeRemaining, dialogInfo } = useGame();
  
  const dialogOpenRef = useRef(false);
  useEffect(() => { dialogOpenRef.current = dialogInfo.show; }, [dialogInfo.show]);
  
  const [activeTerminals, setActiveTerminals] = useState<string[]>([]);
  const [drones, setDrones] = useState<Drone[]>([
    { id: "d1", x: 2, y: 5, dir: "right", patrolRoute: ["right","right","right","right","right","left","left","left","left","left"], patrolIndex: 0 },
    { id: "d2", x: 12, y: 3, dir: "down", patrolRoute: ["down","down","down","up","up","up"], patrolIndex: 0 },
    { id: "d3", x: 7, y: 11, dir: "right", patrolRoute: ["right","right","right","right","left","left","left","left"], patrolIndex: 0 },
    { id: "d4", x: 3, y: 9, dir: "right", patrolRoute: ["right","right","right","right","left","left","left","left"], patrolIndex: 0 },
    { id: "d5", x: 17, y: 2, dir: "down", patrolRoute: ["down","down","down","down","down","up","up","up","up","up"], patrolIndex: 0 },
  ]);

  const [doorOpen, setDoorOpen] = useState(false);

  // Hard ref to playerPos so intervals can check collisions immediately
  const posRef = useRef(playerPos);
  const isHitRef = useRef(false);
  useEffect(() => { posRef.current = playerPos; }, [playerPos]);
  
  // Terminal coordinates
  const terminals = [
    { id: "t1", x: 5, y: 1 },
    { id: "t2", x: 17, y: 1 },
    { id: "t3", x: 9, y: 9 },
    { id: "t4", x: 1, y: 13 },
    { id: "t5", x: 15, y: 6 }
  ];

  // Helper to resolve vectors
  const getDirVec = (dir: Dir) => {
    switch (dir) {
      case "up": return { dx: 0, dy: -1 };
      case "down": return { dx: 0, dy: 1 };
      case "left": return { dx: -1, dy: 0 };
      case "right": return { dx: 1, dy: 0 };
    }
  };

  // TICKER: Drones move exactly 1 block every 700ms
  useEffect(() => {
    const ticker = setInterval(() => {
      if (dialogOpenRef.current) return;
      setDrones(prevDrones => {
        return prevDrones.map(d => {
          const nextIndex = (d.patrolIndex + 1) % d.patrolRoute.length;
          const nextDir = d.patrolRoute[nextIndex];
          const vec = getDirVec(nextDir);
          return {
             ...d,
             x: d.x + vec.dx,
             y: d.y + vec.dy,
             dir: nextDir,
             patrolIndex: nextIndex
          };
        });
      });
    }, 700);
    return () => clearInterval(ticker);
  }, []);

  // DETECTION CHECKER (Runs frequently to catch cross-overs)
  useEffect(() => {
     const checkDetection = setInterval(() => {
        if (dialogOpenRef.current) return; // Pause detection if dialog open
        const px = posRef.current.x;
        const py = posRef.current.y;
        const currentTile = LEVEL2_MAP[py]?.[px];
        
        if (currentTile === undefined) return; // out of bounds bounds check
        
        // If player is in a bush (7), completely hidden.
        if (currentTile === 7) return;

        let detected = false;

        for (const d of drones) {
           // Drone physically touches player
           if (d.x === px && d.y === py) {
              detected = true;
              break;
           }

           const vec = getDirVec(d.dir);
           // Raycast 3 tiles forward for laser vision
           for (let dist = 1; dist <= 3; dist++) {
              const lx = d.x + (vec.dx * dist);
              const ly = d.y + (vec.dy * dist);
              
              // Wall blocks laser
              if (LEVEL2_MAP[ly] && LEVEL2_MAP[ly][lx] === 1) break;
              
              if (lx === px && ly === py) {
                 detected = true;
                 break;
              }
           }
           if (detected) break;
        }

        if (detected && !isHitRef.current) {
           isHitRef.current = true;
           // Boom, caught
           loseLife();
           showDialog("[CRITICAL ALERT] UNAUTHORIZED ENTITY DETECTED. PURGING.");
           // Reset player to safe start
           setPlayerPos({ x: 2, y: 1, dir: "down" });
           
           // I-Frames
           setTimeout(() => { isHitRef.current = false; }, 2000);
        }
     }, 100);

     return () => clearInterval(checkDetection);
  }, [drones, loseLife, showDialog, setPlayerPos]);


  // WASD MOVEMENT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let { x, y, dir } = playerPos;
      
      if (e.key === "w" || e.key === "ArrowUp") { y -= 1; dir = "up"; }
      if (e.key === "s" || e.key === "ArrowDown") { y += 1; dir = "down"; }
      if (e.key === "a" || e.key === "ArrowLeft") { x -= 1; dir = "left"; }
      if (e.key === "d" || e.key === "ArrowRight") { x += 1; dir = "right"; }
      
      if (e.code === "Space") {
        handleInteract();
        return;
      }

      // Bounds & Walls
      if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
        const tile = LEVEL2_MAP[y][x];
        // Cannot walk through walls (1), computers (8), or closed doors (9)
        if (tile !== 1 && tile !== 8 && !(tile === 9 && !doorOpen)) {
           setPlayerPos({ x, y, dir });
           
           // If they walked into the open door (exit)
           if (tile === 9 && doorOpen) {
              showDialog("SECTOR 2 BREACHED. INITIATING CORE DROP.", "system");
              setTimeout(() => {
                 setLives(1);
                 setTimeRemaining(120);
                 setScene("lore3");
              }, 3000);
           }
        } else {
           setPlayerPos({ ...playerPos, dir }); // just turn
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, setPlayerPos, doorOpen, setScene, showDialog]);

  const handleInteract = () => {
    const { x, y, dir } = playerPos;
    let targetX = x; let targetY = y;
    if (dir === "up") targetY -= 1;
    if (dir === "down") targetY += 1;
    if (dir === "left") targetX -= 1;
    if (dir === "right") targetX += 1;

    // Check interaction with Terminal
    if (LEVEL2_MAP[targetY][targetX] === 8) {
       const term = terminals.find(t => t.x === targetX && t.y === targetY);
       if (term && !activeTerminals.includes(term.id)) {
          const nextLength = activeTerminals.length + 1;
          setActiveTerminals(prev => [...prev, term.id]);
          
          showDialog(`SYSTEM OVERRIDE [${nextLength}/5]`);
          
          if (nextLength === 5) {
            setTimeout(() => {
              setDoorOpen(true);
              showDialog("BLAST DOORS OPEN. PROCEED TO CORE.");
            }, 2000);
          }
       } else if (term) {
          // already active
          showDialog("NODE ALREADY COMPROMISED.");
       }
    }
  };


  return (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center font-mono">
       <div className="absolute bottom-6 right-6 text-right z-[120]">
          <div className="text-easter-green text-3xl font-black drop-shadow-[0_0_10px_#32CD32]">
             {activeTerminals.length}/5
          </div>
          <div className="text-white/50 text-sm tracking-widest bg-black/60 px-2 py-1 brutal-border border-white/10 backdrop-blur-sm mt-1">NODES COMPROMISED</div>
       </div>

       <div className="relative border-4 border-easter-purple/30 brutal-shadow p-2 bg-[#0A0A0A]">
          {/* Map Grid */}
          <div 
             className="grid gap-[2px] bg-white/5"
             style={{
               gridTemplateColumns: `repeat(${MAP_WIDTH}, minmax(0, 1fr))`
             }}
          >
             {LEVEL2_MAP.map((row, y) => 
               row.map((cell, x) => (
                  <div key={`${x}-${y}`} className="w-8 h-8 md:w-[42px] md:h-[42px] relative flex items-center justify-center">
                     {/* Wall */}
                     {cell === 1 && <div className="w-full h-full bg-white/20 border border-white/10" />}
                     
                     {/* Bush */}
                     {cell === 7 && (
                        <div className="w-full h-full bg-easter-green/20 border border-easter-green border-dashed overflow-hidden flex items-center justify-center">
                          <span className="text-easter-green/50 text-[10px] animate-pulse">#_#</span>
                        </div>
                     )}

                     {/* Terminal */}
                     {cell === 8 && (
                        <div className={`w-full h-full border-2 ${activeTerminals.includes(terminals.find(t => t.x === x && t.y === y)?.id || "") ? 'bg-easter-green border-easter-green' : 'bg-transparent border-easter-hotpink animate-pulse'} flex items-center justify-center`}>
                           <div className="w-2 h-2 bg-black" />
                        </div>
                     )}

                     {/* Door */}
                     {cell === 9 && (
                        <div className={`w-full h-full border-2 transition-all duration-1000 ${doorOpen ? 'bg-transparent border-easter-green/30' : 'bg-easter-yellow border-easter-yellow'}`} />
                     )}
                  </div>
               ))
             )}
          </div>

          {/* Drones */}
          {drones.map(d => {
             const vec = getDirVec(d.dir);
             const droneRotation = d.dir === 'up' ? -45 : d.dir === 'down' ? 135 : d.dir === 'left' ? -135 : 45;
             return (
               <motion.div
                 key={d.id}
                 className="absolute top-2 left-2 w-8 h-8 md:w-[42px] md:h-[42px] pointer-events-none flex items-center justify-center"
                 animate={{
                    x: d.x * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 44 : 34),
                    y: d.y * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 44 : 34)
                 }}
                 transition={{ duration: 0.7, ease: "linear" }}
               >
                 {/* Sentinel Drone SVG ported from Level 1 */}
                 <div 
                   className="w-[80%] h-[80%] brutal-border animate-pulse shadow-[0_0_15px_rgba(255,0,68,0.8)] z-20"
                   style={{ backgroundColor: "#FF0044", transform: `rotate(${droneRotation}deg)` }}
                 />
                 
                 {/* Laser Vision Projector */}
                 <div 
                   className="absolute bg-gradient-to-r from-red-600/60 to-transparent z-10 pointer-events-none"
                   style={{
                      width: '120px', 
                      height: '4px',
                      transformOrigin: '0 50%',
                      transform: `
                        translate(50%, 0)
                        rotate(${d.dir === 'right' ? 0 : d.dir === 'down' ? 90 : d.dir === 'left' ? 180 : -90}deg)
                        translateX(10px)
                      `
                   }}
                 />
               </motion.div>
             );
          })}

          {/* Player Avatar */}
          <motion.div
             className="absolute top-2 left-2 w-8 h-8 md:w-[42px] md:h-[42px] pointer-events-none flex items-center justify-center z-30"
             animate={{
                x: playerPos.x * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 44 : 34),
                y: playerPos.y * (typeof window !== 'undefined' && window.innerWidth >= 768 ? 44 : 34)
             }}
             transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
             {/* Player SVG Ported from Level 1 Overworld */}
             <div className={`relative w-[80%] h-[100%] ${playerPos.dir === 'left' ? '-scale-x-100' : ''} transition-transform duration-200`}>
                <div className="absolute bottom-0 w-full h-[80%] bg-easter-hotpink rounded-t-lg rounded-b-md drop-shadow-[0_0_15px_#FF69B4] brutal-border border-white overflow-hidden">
                   <div className="absolute top-2 w-full flex justify-around px-1">
                      <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                   </div>
                </div>
                <div className="absolute top-[-4px] left-[20%] w-2 h-4 bg-easter-hotpink rounded-t-full border border-white" />
                <div className="absolute top-[-4px] right-[20%] w-2 h-4 bg-easter-hotpink rounded-t-full border border-white" />
             </div>
          </motion.div>
       </div>
    </div>
  );
}
