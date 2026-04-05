"use client";

import { useEffect } from "react";
import { GameProvider, useGame } from "./GameContext";
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
