"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  color?: "pink" | "blue" | "yellow" | "black";
}

export default function MagneticButton({ children, className = "", onClick, color = "pink" }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  
  const bgColors = {
    pink: "bg-easter-hotpink text-white border-black",
    blue: "bg-easter-blue text-black border-black",
    yellow: "bg-easter-yellow text-black border-black",
    black: "bg-[#1A1A1A] text-white border-transparent",
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-flex items-center justify-center px-10 py-5 rounded-full border-2 font-black text-xl uppercase tracking-widest overflow-hidden group ${bgColors[color]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10 block mix-blend-difference text-white">{children}</span>
      <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 cubic-bezier(.19,1,.22,1) rounded-full" />
    </motion.button>
  );
}
