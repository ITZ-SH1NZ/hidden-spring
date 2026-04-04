"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function LoreScreen({ chapter = 1 }: { chapter?: number }) {
  const { setScene } = useGame();
  const [step, setStep] = useState(0);

  const chapter1Screens = [
    {
      title: "THE HATCHING // A SPRING TALE",
      text: "You are the Easter Bug — a fragment of pure Spring magic born inside the Grey King's colourless fortress. To him, you are an infection. To the world, you are the only hope.\n\nYour mission: find the Spring Egg hidden in the grey garden and use it to break through his fortress walls.",
      align: "center",
      action: "PRESS [SPACE] TO CONTINUE"
    },
    {
      title: "WARREN 1 // THE EGG ROULETTE",
      text: "WARREN 1: THE HIDDEN GARDEN\n\nFive Easter Eggs are buried in this grey maze. Only ONE is the real Spring Egg.\n\n- STAND NEXT TO AN EGG and PRESS [SPACE] to crack it open.\n- Cracking a hollow egg burns 1 LIFE.\n- You have 3 LIVES total.\n- You have 60 SECONDS before the Grey King's purge sweeps the garden.\n\nBeware the Grey Guardians blocking the paths. Defeat them to reveal clues.",
      align: "left",
      action: "PRESS [SPACE] TO ENTER THE GARDEN"
    }
  ];

  const chapter2Screens = [
    {
      title: "DEEPER INTO THE FORTRESS",
      text: "The Spring Egg cracked the outer wall. You've slipped deeper into the Grey King's underground warrens.\n\nBut his patrols are close. They can smell Spring from a mile away.\n\nMove in silence.",
      align: "center",
      action: "PRESS [SPACE] TO CONTINUE"
    },
    {
      title: "WARREN 2 // THE HOLLOW WARREN",
      text: "WARREN 2: THE HOLLOW WARREN\n\n- YOUR COLOUR MAGIC IS SUPPRESSED HERE: You cannot fight.\n- AVOID DETECTION: Patrol Hares sweep Sight-Beams 3 tiles ahead. Caught = instant removal.\n- HIDE: Duck into Bramble Nests (#_#) to break their line of sight.\n- OBJECTIVE: Activate [SPACE] all 5 Colour Nodes to unlock the sealed burrow exit.",
      align: "left",
      action: "PRESS [SPACE] TO ENTER THE WARREN"
    }
  ];

  const chapter3Screens = [
    { title: "THE GREAT TUMBLE", text: "You've slipped through a crack in the fortress floor and you're falling.\n\nThe Grey King is hurling Colour Barriers down after you.\n\nMatch your hue — or be shattered.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "WARREN 3 // THE GREAT TUMBLE", text: "- You are in free-fall through the Grey Sky.\n- The Grey King will send colour-coded barriers.\n- MATCH YOUR COLOUR [SPACE] to phase through matching barriers.\n\nSurvive three waves of barriers to reach the bottom.", align: "left", action: "[ BEGIN THE TUMBLE ]" }
  ];

  const chapter4Screens = [
    { title: "THE GREYSCALE FACTORY", text: "You've landed inside the Grey King's colour-draining factory.\n\nThis is where he drains the life out of Easter Eggs — stripping them of colour and packaging them as hollow grey shells.\n\nYou have to shut it down.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "WARREN 4 // THE FACTORY FLOOR", text: "- Navigate across the high-speed conveyor belts.\n- Avoid the Colour Drain Stamper and grey egg crates.\n- Reach the Colour Restore Terminal at the top to shut the factory down.\n\nGet packaged and you'll lose a life.", align: "left", action: "[ ENTER THE FACTORY ]" }
  ];

  const chapter5Screens = [
    { title: "THE GREY THRONE", text: "The factory is silent. The warrens are empty.\n\nThere is only one door left — and behind it sits the Grey King himself.\n\nThis ends now.", align: "center", action: "[ PRESS SPACE ]" },
    { title: "WARREN 5 // THE GREY KING", text: "Phase 1: Shoot his armour down.\nPhase 2: Dodge his strikes and counter when he's stunned.\n\nClaim the Golden Egg. Bring Spring back.", align: "left", action: "[ FACE THE GREY KING ]" }
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

  // Per-chapter colour theming
  const theme = [
    { color: '#FF69B4', glow: 'rgba(255,105,180,0.25)', label: 'THE HATCHING' },    // ch1
    { color: '#32CD32', glow: 'rgba(50,205,50,0.25)',   label: 'THE WARREN'  },    // ch2
    { color: '#87CEEB', glow: 'rgba(135,206,235,0.25)', label: 'THE TUMBLE'  },    // ch3
    { color: '#9B5DE5', glow: 'rgba(155,93,229,0.25)',  label: 'THE FACTORY' },    // ch4
    { color: '#FF4444', glow: 'rgba(255,68,68,0.25)',   label: 'THE THRONE'  },    // ch5
  ][chapter - 1] || { color: '#FF69B4', glow: 'rgba(255,105,180,0.25)', label: '' };

  // Petal colours cycling through spring palette
  const petalColors = ['#FF69B4','#FFD700','#98FB98','#DDA0DD','#87CEEB','#FFA07A'];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-10 font-mono text-white select-none z-50 overflow-hidden" style={{ backgroundColor: '#050505' }}>

      {/* Chapter-coloured radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 40%, ${theme.glow} 0%, transparent 65%)` }} />

      {/* Floating spring petals */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-bounce"
          style={{
            width:  `${3 + (i % 4) * 2}px`,
            height: `${3 + (i % 4) * 2}px`,
            left:   `${(i * 6.4) % 100}%`,
            top:    `${(i * 11.3 + 4) % 94}%`,
            backgroundColor: petalColors[i % 6],
            opacity: 0.25,
            animationDuration: `${2.2 + (i % 4) * 0.6}s`,
            animationDelay:    `${(i * 0.25) % 2.5}s`,
          }}
        />
      ))}

      {/* Decorative corner eggs */}
      <div className="absolute top-5 left-5 md:top-8 md:left-8 flex flex-col gap-2 pointer-events-none opacity-30">
        <div className="w-5 h-7 md:w-7 md:h-9 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: theme.color, boxShadow: `0 0 12px ${theme.color}` }} />
        <div className="w-3 h-4 md:w-4 md:h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] ml-2" style={{ backgroundColor: '#FFD700' }} />
      </div>
      <div className="absolute top-5 right-5 md:top-8 md:right-8 flex flex-col items-end gap-2 pointer-events-none opacity-30">
        <div className="w-5 h-7 md:w-7 md:h-9 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: theme.color, boxShadow: `0 0 12px ${theme.color}` }} />
        <div className="w-3 h-4 md:w-4 md:h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] mr-2" style={{ backgroundColor: '#98FB98' }} />
      </div>
      <div className="absolute bottom-12 left-6 md:bottom-16 md:left-10 flex gap-2 items-end pointer-events-none opacity-20">
        <div className="w-3 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: '#DDA0DD' }} />
        <div className="w-4 h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: '#87CEEB' }} />
        <div className="w-2 h-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: '#FFD700' }} />
      </div>
      <div className="absolute bottom-12 right-6 md:bottom-16 md:right-10 flex gap-2 items-end pointer-events-none opacity-20">
        <div className="w-2 h-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: '#FFD700' }} />
        <div className="w-4 h-5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: theme.color }} />
        <div className="w-3 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: '#98FB98' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -20, scale: 1.02 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative max-w-2xl w-full"
        >
          {/* Warren progress — egg pip track */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-[6px]">
              {[1,2,3,4,5].map(n => (
                <div
                  key={n}
                  className="rounded-[50%_50%_50%_50%/60%_60%_40%_40%] transition-all duration-500"
                  style={{
                    width:  n === chapter ? '14px' : '10px',
                    height: n === chapter ? '18px' : '13px',
                    backgroundColor: n < chapter ? theme.color : n === chapter ? theme.color : 'transparent',
                    border: `1.5px solid ${n <= chapter ? theme.color : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: n === chapter ? `0 0 10px ${theme.color}` : 'none',
                    opacity: n > chapter ? 0.35 : 1,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] md:text-xs tracking-[0.25em] uppercase" style={{ color: theme.color, opacity: 0.7 }}>
              WARREN {chapter} OF 5 — {theme.label}
            </span>
          </div>

          {/* Card */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'rgba(8,8,8,0.96)',
              borderLeft: `4px solid ${theme.color}`,
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
              borderTop: `1px solid rgba(255,255,255,0.08)`,
              borderRight: `1px solid rgba(255,255,255,0.08)`,
              boxShadow: `0 0 50px ${theme.glow}, inset 0 0 80px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: `linear-gradient(90deg, ${theme.color}, transparent 70%)` }} />

            {/* Inner egg watermark */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.04 }}>
              <div className="w-24 h-32 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ backgroundColor: theme.color }} />
            </div>

            <div className="relative p-6 md:p-10">
              {/* Title */}
              <h2
                className="font-black text-xl md:text-3xl mb-5 md:mb-8 tracking-widest uppercase leading-tight"
                style={{ color: theme.color, textShadow: `0 0 25px ${theme.color}` }}
              >
                {screens[step].title}
              </h2>

              {/* Body text */}
              <div className={`text-white/80 whitespace-pre-line leading-relaxed tracking-wide text-sm md:text-base ${screens[step].align === 'center' ? 'text-center' : 'text-left'}`}>
                {screens[step].text}
              </div>

              {/* Egg divider */}
              <div className="my-6 md:my-10 flex items-center gap-2" style={{ opacity: 0.35 }}>
                <div className="flex-1 h-px" style={{ backgroundColor: theme.color }} />
                {['#FF69B4','#FFD700','#98FB98','#DDA0DD','#87CEEB'].map((c, i) => (
                  <div key={i} className="rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
                    style={{ width: '8px', height: '11px', backgroundColor: c }} />
                ))}
                <div className="flex-1 h-px" style={{ backgroundColor: theme.color }} />
              </div>

              {/* Action prompt */}
              <div className="text-center animate-pulse text-xs tracking-[0.4em]" style={{ color: theme.color, opacity: 0.75 }}>
                {screens[step].action}
              </div>
            </div>
          </div>

          {/* Reset hint */}
          <div className="mt-4 text-center text-[10px] text-red-500/35 tracking-widest">
            [R] CRACK ALL EGGS AND START OVER
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
