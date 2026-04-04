"use client";

import { motion } from "framer-motion";

interface Button3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: "pink" | "blue" | "yellow" | "green";
}

const colorMap = {
  pink: "bg-easter-hotpink text-white",
  blue: "bg-easter-blue text-gray-900",
  yellow: "bg-easter-yellow text-gray-900",
  green: "bg-easter-green text-gray-900",
};

export default function Button3D({ children, onClick, className = "", color = "pink" }: Button3DProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative inline-block outline-none group cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Brutalist Shadow Base */}
      <span className="absolute top-2 left-2 w-full h-full rounded-2xl bg-[#1A1A1A]" />
      
      {/* Top Interactive Layer */}
      <motion.span
        className={`relative block px-10 py-5 text-2xl tracking-wide rounded-2xl border-4 border-[#1A1A1A] transition-transform ${colorMap[color]} font-bold shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]`}
        whileHover={{ y: -2, x: -2 }}
        whileTap={{ x: 6, y: 6, transition: { duration: 0.1 } }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
