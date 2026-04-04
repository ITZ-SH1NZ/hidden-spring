"use client";

import { useEffect, useState } from "react";
import { GameProvider, useGame, SceneType } from "./GameContext";
import BrutalistDialog from "@/components/game/BrutalistDialog";
import LoreScreen from "@/components/game/LoreScreen";
import GameHUD from "@/components/game/GameHUD";
import RPGOverworld from "@/components/game/RPGOverworld";
import BattleScreen from "@/components/game/BattleScreen";
import MazeDungeon from "@/components/game/MazeDungeon";
import GameOverScreen from "@/components/game/GameOverScreen";
import LevelComplete from "@/components/game/LevelComplete";
import Level2Stealth from "@/components/game/Level2Stealth";
import Level3Runner from "@/components/game/Level3Runner";
import Level4Forge from "@/components/game/Level4Forge";
import Level5Boss from "@/components/game/Level5Boss";
import EndingScreen from "@/components/game/EndingScreen";
import MobileJoypad from "@/components/game/MobileJoypad";
import PauseMenu from "@/components/game/PauseMenu";
import SceneTransition from "@/components/game/SceneTransition";

const DEV_SCENES: { label: string; scene: SceneType }[] = [
  { label: "Lore 1",    scene: "lore"           },
  { label: "Warren 1",  scene: "overworld"       },
  { label: "Battle",    scene: "battle"          },
  { label: "Lv Clear",  scene: "level_complete"  },
  { label: "Lore 2",    scene: "lore2"           },
  { label: "Warren 2",  scene: "level2_stealth"  },
  { label: "Lore 3",    scene: "lore3"           },
  { label: "Warren 3",  scene: "level3_runner"   },
  { label: "Lore 4",    scene: "lore4"           },
  { label: "Warren 4",  scene: "level4_forge"    },
  { label: "Lore 5",    scene: "lore5"           },
  { label: "Ending",    scene: "ending"          },
  { label: "Game Over", scene: "gameover"        },
];

const DEV_BOSS_PHASES: { label: string; phase: number }[] = [
  { label: "P1 Shooter",   phase: 1   },
  { label: "P1.5 Briefing", phase: 1.5 },
  { label: "P2 Fighter",   phase: 2   },
  { label: "P3 Egg Drop",  phase: 3   },
  { label: "P4 Victory",   phase: 4   },
];

function DevSkip() {
  const { setScene, scene, setDevBossPhase, devBossPhase } = useGame();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Backquote") setOpen(prev => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-2 left-2 z-[9999] text-[9px] text-white/25 font-mono hover:text-white/60 transition-colors px-1"
    >
      [DEV]
    </button>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-[#0A0A0A] border-2 border-easter-hotpink p-5 font-mono w-[340px]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-easter-hotpink font-black tracking-widest text-sm uppercase">Dev Skip</span>
          <span className="text-white/30 text-xs">[`] to close</span>
        </div>
        <div className="text-white/40 text-xs mb-3">Current: <span className="text-white">{scene}</span></div>
        <div className="grid grid-cols-2 gap-2">
          {DEV_SCENES.map(({ label, scene: s }) => (
            <button
              key={s}
              onClick={() => { setScene(s); setOpen(false); }}
              className={`text-xs py-2 px-3 border text-left transition-colors ${scene === s ? 'border-easter-hotpink text-easter-hotpink bg-easter-hotpink/10' : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-white/40 text-xs mb-2">BOSS PHASES</div>
          <div className="grid grid-cols-2 gap-2">
            {DEV_BOSS_PHASES.map(({ label, phase }) => (
              <button
                key={phase}
                onClick={() => { setDevBossPhase(phase); setScene("level5_boss"); setOpen(false); }}
                className={`text-xs py-2 px-3 border text-left transition-colors ${scene === "level5_boss" && devBossPhase === phase ? 'border-easter-yellow text-easter-yellow bg-easter-yellow/10' : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneRouter() {
  const { scene, setScene } = useGame();

  // Prevent scrolling on game page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <main className="relative w-screen h-[100dvh] bg-[#0A0A0A] text-white overflow-hidden font-sans flex flex-col">
      
      {/* GAME VIEWPORT */}
      <div className="relative w-full h-[75vh] md:h-full flex-grow overflow-hidden">
      {/* The HUD is persistent across most scenes except ending/lore */}
      {scene !== "ending" && scene !== "lore" && scene !== "lore2" && scene !== "lore3" && scene !== "lore4" && scene !== "lore5" && <GameHUD />}
      
      {/* Scene Switcher */}
      {scene === "lore" && <LoreScreen chapter={1} />}
      {scene === "lore2" && <LoreScreen chapter={2} />}
      {scene === "lore3" && <LoreScreen chapter={3} />}
      {scene === "lore4" && <LoreScreen chapter={4} />}
      {scene === "lore5" && <LoreScreen chapter={5} />}
      {scene === "gameover" && <GameOverScreen />}
      {scene === "level_complete" && <LevelComplete />}
      {scene === "overworld" && <RPGOverworld />}
      {scene === "battle" && <BattleScreen />}
      {scene === "maze" && <MazeDungeon />}
      {scene === "level2_stealth" && <Level2Stealth />}
      {scene === "level3_runner" && <Level3Runner />}
      {scene === "level4_forge" && <Level4Forge />}
      {scene === "level5_boss" && <Level5Boss />}
      {scene === "ending" && <EndingScreen />}
      
      <BrutalistDialog />
      <PauseMenu />
      <SceneTransition />
      <DevSkip />
      </div>

      {/* MOBILE HUD CONTAINER (Hidden on Desktop) */}
      <div className="relative w-full h-[25vh] md:hidden flex-shrink-0 z-[1000]">
         <MobileJoypad />
      </div>

    </main>
  );
}

export default function GamePage() {
  return (
    <GameProvider>
      <SceneRouter />
    </GameProvider>
  );
}
