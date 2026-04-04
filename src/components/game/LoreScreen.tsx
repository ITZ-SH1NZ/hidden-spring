"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function LoreScreen({ chapter = 1 }: { chapter?: number }) {
  const { setScene } = useGame();
  const [step, setStep] = useState(0);

  const chapter1Screens = [
    {
      title: "SYS.LORE // THE INJECTION",
      text: "You are the 'Easter Bug', a rogue chaotic script injected into the Architect's sterile, monochrome mainframe. Your directive: Infect the core structure with 'Spring' by locating the scattered Data-Eggs.",
      align: "center",
      action: "PRESS [SPACE] TO CONTINUE"
    },
    {
      title: "SYS.TUTORIAL // DIRECTIVE 01",
      text: "SECTOR 1: THE EGG ROULETTE\n\nThere are 5 Eggs hidden in this logic maze. Only ONE is the elusive Golden Core.\n\n- STAND NEXT TO AN EGG and PRESS [SPACE] to guess.\n- Guessing a dummy egg SHATTERS it and burns 1 LIFE.\n- You have 3 LIVES total.\n- You have 60 SECONDS before a system purge initiates.\n\nBeware the Guardian Drones blocking the paths. They must be eliminated.",
      align: "left",
      action: "PRESS [SPACE] TO INITIATE BREACH"
    }
  ];

  const chapter2Screens = [
    {
      title: "SYS.LORE // THE DESCENT",
      text: "The Architect's firewall was thicker than anticipated, but the Golden Egg cracked the outer shell. You have descended deeper into the Core Logic.\n\nBut they are hunting you.",
      align: "center",
      action: "PRESS [SPACE] TO CONTINUE"
    },
    {
      title: "SYS.TUTORIAL // DIRECTIVE 02",
      text: "SECTOR 2: THE STEALTH MATRIX\n\n- COMBAT ARRAYS OFFLINE: You cannot attack.\n- AVOID DETECTION: Drones sweep red logic lasers 3-tiles forward. If they see you, you die instantly.\n- HIDE: Duck into green Glitch Bushes (#_#) to evade visual sensors.\n- OBJECTIVE: Hack [SPACE] the 4 pink Terminals scattered in the maze to open the Core door.",
      align: "left",
      action: "PRESS [SPACE] TO ENTER MATRIX"
    }
  ];

  const chapter3Screens = [
    { title: "SECTOR III BREACHED", text: "Warning: Catastrophic corruption detected.\nYou have entered THE DATA STREAM.\n\nGravity protocols Offline.\nSecurity matrices intercepting.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "THE DATA STREAM", text: "- You are in free-fall.\n- The Architect will deploy data-blocks.\n- Match your polarity to phase through barriers.\n\nSurvive three firewall descents.", align: "left", action: "[ INITIATE TERMINAL DROP ]" }
  ];

  const chapter4Screens = [
    { title: "SECTOR IV BREACHED", text: "Warning: Unsanctioned access to THE EGG FORGE detected.\n\nThe Architect's automated assembly line.\nHere, hollow data shells are painted with malicious payloads and packaged as Easter Eggs.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "THE ASSEMBLY LINE", text: "- Navigate across the high-speed conveyor belts.\n- Avoid the descending Paint Stampers and logic crates.\n- Reach the Top Terminal to override the Forge.\n\nFailure will result in immediate packaging.", align: "left", action: "[ INITIATE FORGE SEQUENCE ]" }
  ];

  const chapter5Screens = [
    { title: "SECTOR V BREACHED", text: "Warning: Unsanctioned access to THE ARCHITECT'S NEST.\n\nAll Firewalls destroyed.\nForge overriden.\nInitializing purge protocol.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "THE ARCHITECT", text: "Phase 1: Shoot it down.\nPhase 2: Counter its physical strikes.\n\nSecure the Golden Egg. End the corruption.", align: "left", action: "[ INITIATE COMBAT ]" }
  ];

  const screens = chapter === 1 ? chapter1Screens : 
                  chapter === 2 ? chapter2Screens : 
                  chapter === 3 ? chapter3Screens :
                  chapter === 4 ? chapter4Screens :
                  chapter5Screens;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyR") {
         localStorage.removeItem("easterBugSave");
         window.location.reload();
      }
      if (e.code === "Space") {
        if (step < screens.length - 1) {
          setStep(prev => prev + 1);
        } else {
          const nextScene = chapter === 1 ? "overworld" : 
                            chapter === 2 ? "level2_stealth" : 
                            chapter === 3 ? "level3_runner" :
                            chapter === 4 ? "level4_forge" :
                            "level5_boss";
          setScene(nextScene);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, setScene, screens.length]);

  return (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center p-6 md:p-12 font-mono text-white select-none z-50">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full border border-white/20 bg-white/[0.02] p-6 md:p-10 brutal-shadow relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] opacity-50" />
          
          <h2 className="text-easter-purple font-black text-lg md:text-xl mb-4 md:mb-8 tracking-widest uppercase">
            {screens[step].title}
          </h2>
          
          <div className={`text-white/80 whitespace-pre-line leading-relaxed tracking-wide text-sm md:text-lg ${screens[step].align === 'center' ? 'text-center' : 'text-left'}`}>
             {screens[step].text}
          </div>

          <div className="mt-8 md:mt-16 text-center animate-pulse text-xs text-white/40 tracking-[0.3em]">
             {screens[step].action}
          </div>
          
          <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-red-500/50 opacity-50">
             PRESS [R] TO WIPE ARCHIVE CACHE
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
