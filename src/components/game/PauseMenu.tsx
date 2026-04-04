"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/app/game/GameContext";
import { playSound } from "@/utils/sound";

const ACTIVE_SCENES = new Set(["overworld", "battle", "level2_stealth", "level3_runner", "level4_forge", "level5_boss"]);

export default function PauseMenu() {
  const { scene, isPaused, setIsPaused } = useGame();
  const router = useRouter();

  // ESC toggles pause (only during active gameplay)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Escape" && ACTIVE_SCENES.has(scene)) {
        setIsPaused(!isPaused);
        playSound("pause");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scene, isPaused, setIsPaused]);

  if (!ACTIVE_SCENES.has(scene)) return null;

  const handleResume = () => {
    playSound("ui_click");
    setIsPaused(false);
  };

  const handleRestart = () => {
    playSound("ui_click");
    localStorage.removeItem("easterBugSave");
    window.location.reload();
  };

  const handleMainMenu = () => {
    playSound("ui_click");
    router.push("/");
  };

  const handleFullscreen = () => {
    playSound("ui_click");
    document.documentElement.requestFullscreen().catch(() => {});
  };

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="border-4 border-easter-hotpink bg-[#0A0A0A] p-10 flex flex-col items-center gap-6 min-w-[300px] brutal-shadow"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-easter-hotpink font-black text-4xl tracking-[0.3em] uppercase drop-shadow-[0_0_20px_#FF69B4]">
              PAUSED
            </h2>

            <div className="w-full h-px bg-easter-hotpink/30" />

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleResume}
                className="w-full py-3 border-2 border-white text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
              >
                RESUME
              </button>
              <button
                onClick={handleFullscreen}
                className="w-full py-3 border-2 border-easter-hotpink/50 text-easter-hotpink/80 font-black tracking-widest uppercase hover:border-easter-hotpink hover:text-easter-hotpink transition-colors"
              >
                FULLSCREEN
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3 border-2 border-white/30 text-white/60 font-black tracking-widest uppercase hover:border-white/60 hover:text-white transition-colors"
              >
                RESTART
              </button>
              <button
                onClick={handleMainMenu}
                className="w-full py-3 border-2 border-white/20 text-white/40 font-black tracking-widest uppercase hover:border-white/50 hover:text-white/70 transition-colors"
              >
                MAIN MENU
              </button>
            </div>

            <div className="text-white/20 text-xs tracking-widest">ESC TO RESUME</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
