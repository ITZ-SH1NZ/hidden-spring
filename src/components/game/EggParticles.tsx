"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EggParticlesProps {
  active: boolean;
  isGood: boolean;
}

const GOOD_COLORS = ["#FF69B4", "#FFD700", "#98FB98", "#87CEEB", "#DDA0DD", "#FF9B54", "#B0E0E6", "#FFC0CB"];
const BAD_COLORS = ["#555555", "#444444", "#333333", "#666666", "#777777", "#888888", "#222222", "#999999"];

const NUM_PARTICLES = 8;

export default function EggParticles({ active, isGood }: EggParticlesProps) {
  const [visible, setVisible] = useState(false);
  const [instanceKey, setInstanceKey] = useState(0);

  useEffect(() => {
    if (active) {
      setVisible(true);
      setInstanceKey(k => k + 1);
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [active]);

  const colors = isGood ? GOOD_COLORS : BAD_COLORS;

  return (
    <AnimatePresence>
      {visible && (
        <div key={instanceKey} className="absolute inset-0 pointer-events-none flex items-center justify-center z-[300]">
          {Array.from({ length: NUM_PARTICLES }).map((_, i) => {
            const angle = (i / NUM_PARTICLES) * 360;
            const distance = 60 + Math.random() * 40;
            const rad = (angle * Math.PI) / 180;
            const tx = Math.cos(rad) * distance;
            const ty = Math.sin(rad) * distance;
            const size = 8 + Math.floor(Math.random() * 8);
            const color = colors[i % colors.length];

            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ width: size, height: size, backgroundColor: color }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: tx, y: ty, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
