"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

interface Obstacle {
  id: number;
  x: number; // percentage 0-100
  width: number; // percentage
  y: number; // pixel absolute from top
  color: "green" | "purple";
  passed: boolean;
  isNode?: boolean; // If true, it's a Firewall Boss Node!
}

export default function Level3Runner() {
  const { setScene, timeRemaining, loseLife, lives, showDialog, dialogInfo } = useGame();
  
  const [playerX, setPlayerX] = useState(50); // Center percentage
  const [isGreenPhase, setIsGreenPhase] = useState(true);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const [phase, setPhase] = useState(1);
  const [flash, setFlash] = useState(false);
  const [breachText, setBreachText] = useState("");
  const [cameraShake, setCameraShake] = useState(false);
  
  // Game loop refs
  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const playStateRef = useRef({ x: 50, isGreen: true });
  const isHitRef = useRef(false);
  const phaseRef = useRef(1);
  const sessionStartTime = useRef<number | null>(null);
  const nextNodeTime = useRef<number>(15000); // 15s per phase
  const isSpawningNode = useRef(false);
  const isPaused = useRef(false);
  const lastFrameTime = useRef<number>(0);
  
  const dialogOpenRef = useRef(false);
  useEffect(() => { dialogOpenRef.current = dialogInfo.show; }, [dialogInfo.show]);
  
  // Sync state to refs for fast game loop access
  useEffect(() => { playStateRef.current.x = playerX; }, [playerX]);
  useEffect(() => { playStateRef.current.isGreen = isGreenPhase; }, [isGreenPhase]);

  // Keys Tracking
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.code === "Space") {
        setIsGreenPhase(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update Game Loop
  const updateLoop = (time: number) => {
    let deltaTime = 0;
    if (lastFrameTime.current > 0) {
       deltaTime = time - lastFrameTime.current;
    }
    lastFrameTime.current = time;

    if (isPaused.current || dialogOpenRef.current) {
       // Push time anchors forward so we don't jump when unpaused
       if (sessionStartTime.current) sessionStartTime.current += deltaTime;
       if (lastSpawnTime.current) lastSpawnTime.current += deltaTime;
       
       requestRef.current = requestAnimationFrame(updateLoop);
       return;
    }

    if (!sessionStartTime.current) sessionStartTime.current = time;
    const elapsed = time - sessionStartTime.current;

    // Player Movement
    setPlayerX(prev => {
      let newX = prev;
      const speed = 1.0; // movement speed per frame
      if (keys.current["ArrowLeft"] || keys.current["a"]) newX -= speed;
      if (keys.current["ArrowRight"] || keys.current["d"]) newX += speed;
      return Math.max(5, Math.min(95, newX));
    });

    // Spawning logic
    if (elapsed > nextNodeTime.current && !isSpawningNode.current) {
       isSpawningNode.current = true;
       const color = Math.random() > 0.5 ? "green" : "purple";
       obstaclesRef.current.push({ id: time, x: 0, width: 100, y: -100, color, passed: false, isNode: true });
    } else if (!isSpawningNode.current && time - lastSpawnTime.current > (1200 - (phaseRef.current * 150))) {
      const isWall = Math.random() > 0.80; 
      const color = Math.random() > 0.5 ? "green" : "purple";
      const newObs: Obstacle = isWall 
        ? { id: time, x: 0, width: 100, y: -50, color, passed: false }
        : { id: time, x: Math.random() * 70, width: 30, y: -50, color, passed: false };
      obstaclesRef.current.push(newObs);
      lastSpawnTime.current = time;
    }

    // Move Obstacles and Collision Checking
    const speed = 3.0 + (phaseRef.current * 1.5);
    const playerY = window.innerHeight - 150;
    const playerWidthPct = 8;
    const pColor = playStateRef.current.isGreen ? "green" : "purple";

    let shouldCancelLoop = false;

    obstaclesRef.current.forEach(ob => {
       ob.y += speed;

       if (ob.y + 40 > playerY && ob.y < playerY + 50) {
          const pLeft = playStateRef.current.x - (playerWidthPct / 2);
          const pRight = playStateRef.current.x + (playerWidthPct / 2);
          const oLeft = ob.x;
          const oRight = ob.x + ob.width;

          if (pRight > oLeft && pLeft < oRight) {
             if (ob.color === pColor) {
                if (ob.isNode && !ob.passed) {
                   ob.passed = true;
                   ob.y = window.innerHeight + 100; // Yeet offscreen

                   // Pause game loop logic
                   isPaused.current = true;
                   
                   phaseRef.current += 1;
                   setPhase(phaseRef.current);
                   isSpawningNode.current = false;
                   
                   setFlash(true);
                   setBreachText(`GREY BARRIER ${phaseRef.current - 1} SHATTERED`);
                   setCameraShake(true);
                   
                   // Delete all other objects
                   obstaclesRef.current = [];

                   setTimeout(() => {
                      setFlash(false);
                      setBreachText("");
                      setCameraShake(false);
                      
                      // Unpause and re-anchor timing
                      sessionStartTime.current = null;
                      lastSpawnTime.current = 0;
                      nextNodeTime.current = 15000;
                      isPaused.current = false;
                   }, 2000); // Wait 2s before resuming

                   if (phaseRef.current > 3) {
                      shouldCancelLoop = true;
                      setScene("lore4");
                   }
                }
             } else if (!isHitRef.current) {
                isHitRef.current = true;
                loseLife();
                showDialog("WRONG COLOUR! BARRIER CLASHED.", "system");
                setCameraShake(true);
                setTimeout(() => { 
                   isHitRef.current = false; 
                   setCameraShake(false);
                }, 2000);
             }
          }
       }
    });

    obstaclesRef.current = obstaclesRef.current.filter(ob => ob.y < window.innerHeight + 100);
    setObstacles([...obstaclesRef.current]);

    if (!shouldCancelLoop) {
      requestRef.current = requestAnimationFrame(updateLoop);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(requestRef.current as number);
  }, []);

  // Deprecated random timer win
  // useEffect(() => {
  //   if (timeRemaining <= 0 && lives > 0) { ... }
  // }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden font-mono z-0 transition-transform`} style={{ background: 'linear-gradient(to bottom, #0A1A2E 0%, #0D1810 40%, #050505 100%)' }}>

       {/* Falling petals background */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => (
             <div
               key={i}
               className="absolute rounded-full opacity-30 animate-bounce"
               style={{
                  width: `${4 + (i % 4) * 3}px`,
                  height: `${4 + (i % 4) * 3}px`,
                  left: `${(i * 7.2) % 100}%`,
                  top: `${(i * 13 + 10) % 90}%`,
                  backgroundColor: ['#FF69B4','#FFD700','#98FB98','#DDA0DD','#87CEEB'][i % 5],
                  animationDuration: `${2 + (i % 4)}s`,
                  animationDelay: `${(i * 0.4) % 2}s`,
               }}
             />
          ))}
       </div>

       {/* Phase Flash Overlay */}
       {flash && <div className="absolute inset-0 bg-white z-[200] opacity-50" />}
       
       {/* Breach Text Alert */}
       {breachText && (
          <div className="absolute inset-0 flex items-center justify-center z-[250] pointer-events-none">
             <div className="text-4xl md:text-6xl font-black text-white mix-blend-difference uppercase tracking-[0.5em] text-center px-4 animate-pulse">
                {breachText}
             </div>
          </div>
       )}

       {/* HUD Additions */}
       <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none text-white drop-shadow-md">
          <span className="text-xs opacity-50 uppercase tracking-widest">GREY BARRIER DESCENT</span>
          <div className="flex gap-2 font-black text-2xl tracking-widest mt-1">
             <span className={phase > 1 ? 'text-easter-green shadow-[0_0_10px_#32CD32]' : 'text-white/20'}>01</span> / 
             <span className={phase > 2 ? 'text-easter-green shadow-[0_0_10px_#32CD32]' : 'text-white/20'}>02</span> / 
             <span className={phase > 3 ? 'text-easter-green shadow-[0_0_10px_#32CD32]' : 'text-white/20'}>03</span>
          </div>
       </div>

       <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none">
          {obstacles.map(ob => (
             <div 
               key={ob.id}
               className={`absolute border-2 flex items-center justify-center overflow-hidden ${ob.isNode ? 'h-32 opacity-90' : 'h-10 opacity-70'} shadow-[0_0_20px_inset_rgba(0,0,0,0.5)]`}
               style={{
                  top: `${ob.y}px`,
                  left: `${ob.x}%`,
                  width: `${ob.width}%`,
                  backgroundColor: ob.color === "green" ? "rgba(50, 205, 50, 0.4)" : "rgba(155, 93, 229, 0.4)",
                  borderColor: ob.color === "green" ? "#32CD32" : "#9B5DE5",
                  boxShadow: `0 0 20px ${ob.color === "green" ? "#32CD32" : "#9B5DE5"}`
               }}
             >
                {ob.isNode && (
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-white/60 animate-pulse" style={{ backgroundColor: ob.color === "green" ? "rgba(50,205,50,0.6)" : "rgba(155,93,229,0.6)" }} />
                      <span className="font-mono text-white/70 text-xl font-black uppercase tracking-widest">[ GREY BARRIER ]</span>
                      <div className="w-6 h-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-white/60 animate-pulse" style={{ backgroundColor: ob.color === "green" ? "rgba(50,205,50,0.6)" : "rgba(155,93,229,0.6)" }} />
                   </div>
                )}
             </div>
          ))}
       </div>

       {/* The Player Avatar */}
       <div 
          className="absolute bottom-[100px] w-12 h-16 pointer-events-none transition-transform duration-75 flex flex-col items-center justify-center z-30"
          style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
       >
          <div className="relative w-[80%] h-[100%] transition-transform duration-200">
             <div className={`absolute bottom-0 w-full h-[80%] rounded-t-lg rounded-b-md ${isGreenPhase ? 'bg-easter-green drop-shadow-[0_0_15px_#32CD32]' : 'bg-easter-purple drop-shadow-[0_0_15px_#9B5DE5]'} brutal-border border-white overflow-hidden transition-colors duration-300`}>
                <div className={`absolute top-2 w-full flex justify-around px-1 ${isHitRef.current ? 'animate-ping' : ''}`}>
                   <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                   <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                </div>
             </div>
             {/* Ears */}
             <div className={`absolute top-[-4px] left-[20%] w-2 h-4 ${isGreenPhase ? 'bg-easter-green' : 'bg-easter-purple'} rounded-t-full border border-white transition-colors duration-300`} />
             <div className={`absolute top-[-4px] right-[20%] w-2 h-4 ${isGreenPhase ? 'bg-easter-green' : 'bg-easter-purple'} rounded-t-full border border-white transition-colors duration-300`} />
          </div>
       </div>

       {/* Desktop Overlay Controls */}
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] hidden md:flex items-center justify-center">
          <button 
             onClick={() => setIsGreenPhase(prev => !prev)}
             tabIndex={-1}
             className={`px-8 py-3 font-black text-xl brutal-border shadow-lg active:scale-95 transition-all text-white ${isGreenPhase ? 'bg-easter-purple border-easter-purple' : 'bg-easter-green border-easter-green'}`}
          >
             SHIFT {isGreenPhase ? 'PURPLE' : 'GREEN'}
          </button>
       </div>
    </div>
  );
}
