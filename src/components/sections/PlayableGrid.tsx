"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BasketSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] drop-shadow-[0_10px_0_rgba(0,0,0,0.5)] cursor-pointer hover:brightness-110" stroke="black" strokeWidth="4">
    <path d="M10 50 Q50 90 90 50 Z" fill="#D2B48C" strokeLinejoin="round" />
    <path d="M10 50 Q50 30 90 50" fill="none" />
    <path d="M20 50 C20 10 80 10 80 50" fill="none" strokeWidth="8" strokeLinecap="round" />
    {/* Eggs peering out */}
    <ellipse cx="40" cy="45" rx="10" ry="15" fill="#FFB6C1" />
    <ellipse cx="60" cy="45" rx="10" ry="15" fill="#AEE2FF" />
    <path d="M10 50 Q50 65 90 50 Z" fill="#8B4513" stroke="none" opacity="0.3" />
  </svg>
);

const FastEggSVG = () => (
  <svg viewBox="0 0 100 100" className="w-[80px] h-[100px] fill-[#FFD700] stroke-black stroke-[4px] drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] cursor-pointer hover:scale-110" strokeLinejoin="round">
    <path d="M 50 5 C 80 5 95 60 70 85 C 60 95 40 95 30 85 C 5 60 20 5 50 5 Z" />
    {/* Decorative Lines */}
    <path d="M 15 50 Q 50 30 85 50" fill="none" stroke="black" strokeWidth="4" />
    <path d="M 22 70 Q 50 50 78 70" fill="none" stroke="black" strokeWidth="4" />
    <circle cx="50" cy="50" r="6" fill="black" />
  </svg>
);

export default function PlayableGrid() {
  type GameState = "IDLE" | "CHASE" | "REWARD" | "FAIL";
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [timeLeft, setTimeLeft] = useState(5);
  
  // For the moving egg
  const [eggPos, setEggPos] = useState({ x: 50, y: 50 });

  // Handle the chase sequence timer & egg movement
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let tickerId: NodeJS.Timeout;

    if (gameState === "CHASE") {
      // Countdown
      timerId = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState("FAIL");
            return 0;
          }
          return t - 1;
        });
      }, 1000);

      // Fast erratic movement
      tickerId = setInterval(() => {
        setEggPos({
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        });
      }, 600); // Teleports every 600ms
    }

    return () => {
      clearInterval(timerId);
      clearInterval(tickerId);
    };
  }, [gameState]);

  const startChase = () => {
    setTimeLeft(5);
    setGameState("CHASE");
  };

  const catchEgg = () => {
    setGameState("REWARD");
  };

  const resetGame = () => {
    setGameState("IDLE");
  };

  return (
    <section className="relative w-full py-24 bg-[#1A1A1A] border-y-[8px] border-black flex flex-col items-center justify-center min-h-[80vh] overflow-hidden z-20">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-easter-pink opacity-5 blur-[150px] pointer-events-none" />

      {/* The Narrative Header */}
      <div className="mb-8 text-center text-white relative z-10 w-full px-4 mt-12 md:mt-0">
        <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-black text-outline-sm drop-shadow-[0_4px_0_#FF69B4] leading-none mb-4 tracking-tighter uppercase">
          {gameState === "IDLE" && "The Discovery"}
          {gameState === "CHASE" && "The Pressure Hunt"}
          {gameState === "REWARD" && "The Reward"}
          {gameState === "FAIL" && "It Escaped"}
        </h2>
        <p className="text-[clamp(1rem,1.5vw,1.2rem)] font-bold text-gray-300 max-w-md mx-auto h-[3rem]">
          {gameState === "IDLE" && "Deep in the grass, a strange shaking basket catches your eye..."}
          {gameState === "CHASE" && "The Golden Token is fleeing! Catch it before time runs out!"}
          {gameState === "REWARD" && "You caught the legend. The true game awaits you inside."}
          {gameState === "FAIL" && "You hesitated. The token burrowed deep underground."}
        </p>
      </div>

      {/* The Stage Container */}
      <div className="relative z-10 w-[90vw] max-w-4xl h-[50vh] min-h-[400px] bg-easter-green rounded-[30px] border-[6px] border-black brutal-shadow overflow-hidden isolation-auto flex items-center justify-center">
        
        {/* Scenery */}
        <div className="absolute bottom-0 w-full h-[30%] bg-black/10 rounded-t-[100%] pointer-events-none z-0" />

        <AnimatePresence mode="wait">
          {/* STAGE 1: IDLE */}
          {gameState === "IDLE" && (
            <motion.div 
              key="idle"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, rotate: 180, opacity: 0 }}
              className="z-10 flex flex-col items-center"
            >
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={startChase}
              >
                <BasketSVG />
              </motion.div>
              <div className="mt-4 px-4 py-2 bg-black text-white font-black uppercase tracking-widest text-sm rounded-full animate-bounce pointer-events-none">
                Click to Open
              </div>
            </motion.div>
          )}

          {/* STAGE 2: CHASE */}
          {gameState === "CHASE" && (
            <motion.div key="chase" className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Timer UI */}
              <div className="absolute top-4 right-6 text-4xl font-black text-white text-outline-sm drop-shadow-[0_4px_0_#F00]">
                {timeLeft}s
              </div>
              
              <motion.div
                className="absolute"
                animate={{ left: `${eggPos.x}%`, top: `${eggPos.y}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                onClick={catchEgg}
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <FastEggSVG />
              </motion.div>
            </motion.div>
          )}

          {/* STAGE 3: REWARD / FAIL */}
          {(gameState === "REWARD" || gameState === "FAIL") && (
            <motion.div 
              key="end" 
              className="z-30 flex flex-col items-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl border-4 border-black brutal-shadow text-center"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            >
              {gameState === "REWARD" ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="mb-6 scale-150 relative">
                  <div className="absolute inset-0 bg-yellow-300 blur-xl rounded-full" />
                  <FastEggSVG />
                </motion.div>
              ) : (
                <div className="text-[5rem] mb-4">💨</div>
              )}
              
              <button 
                onClick={resetGame}
                className="px-8 py-4 bg-easter-blue text-black font-black text-xl border-4 border-black transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none uppercase tracking-widest"
              >
                {gameState === "REWARD" ? "Play Again" : "Retry"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}
