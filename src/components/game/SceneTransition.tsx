"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame, SceneType } from "@/app/game/GameContext";

function getFlashColor(scene: SceneType): string {
  switch (scene) {
    case "lore":
    case "lore2":
    case "lore3":
    case "lore4":
    case "lore5":
    case "gameover":
      return "#000000";
    case "overworld":
    case "battle":
      return "#FF69B4";
    case "level2_stealth":
      return "#32CD32";
    case "level3_runner":
      return "#87CEEB";
    case "level4_forge":
      return "#9B5DE5";
    case "level5_boss":
      return "#FF4444";
    case "level_complete":
      return "#FFD700";
    case "ending":
      return "#FFFFFF";
    default:
      return "#000000";
  }
}

export default function SceneTransition() {
  const { scene } = useGame();
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState("#000000");
  const [key, setKey] = useState(0);

  useEffect(() => {
    setFlashColor(getFlashColor(scene));
    setIsFlashing(true);
    setKey(k => k + 1);
    const t = setTimeout(() => setIsFlashing(false), 400);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <AnimatePresence>
      {isFlashing && (
        <motion.div
          key={key}
          className="absolute inset-0 pointer-events-none z-[150]"
          style={{ backgroundColor: flashColor }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
