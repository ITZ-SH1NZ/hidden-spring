"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useAnimation } from "framer-motion";

const EggPointerSVG = ({ isHovering, isClicked }: { isHovering: boolean; isClicked: boolean }) => {
  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className="w-8 h-8 md:w-10 md:h-10 origin-top-left"
      animate={{
        scaleX: isClicked ? 1.4 : isHovering ? 1.2 : 1,
        scaleY: isClicked ? 0.7 : isHovering ? 1.2 : 1,
        rotate: isHovering ? 15 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 25,
        mass: 0.5
      }}
    >
      <g transform="translate(10, 10)">
        {/* Heavy Brutalist Shadow */}
        <path d="M 40 5 C 65 5 80 50 65 75 C 50 95 30 95 15 75 C 0 50 15 5 40 5 Z" fill="#1A1A1A" transform="translate(5, 5)" />
        
        {/* Main Egg Body */}
        <motion.path 
          d="M 40 5 C 65 5 80 50 65 75 C 50 95 30 95 15 75 C 0 50 15 5 40 5 Z" 
          animate={{ fill: isHovering ? "#FF69B4" : "#FFF9D2" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          stroke="black" strokeWidth="6" strokeLinejoin="round" 
        />
        
        {/* Zigzag Pattern */}
        <motion.path 
          d="M 10 50 L 25 40 L 40 50 L 55 40 L 70 50 M 15 65 L 30 55 L 45 65 L 60 55 L 75 65" 
          fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" 
          animate={{ opacity: isHovering ? 0 : 0.5 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Click Hotspot Indicator (Tiny Dot at top left corner) */}
        <circle cx="20" cy="15" r="4" fill="black" />
      </g>
    </motion.svg>
  );
};

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Snappy springs for the cursor itself to create a physical but exact drag
  const cursorX = useSpring(-100, { stiffness: 800, damping: 30, mass: 0.1 });
  const cursorY = useSpring(-100, { stiffness: 800, damping: 30, mass: 0.1 });

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse), (hover: none)").matches;
    if (isTouchDevice || window.innerWidth <= 768) {
      setIsMobile(true);
      return;
    }
    
    setIsMobile(false);

    // Hide default cursor only if not mobile
    document.body.style.cursor = "none";
    const styleBlock = document.createElement("style");
    styleBlock.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(styleBlock);

    const mouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Offset by -10, -10 so the hotspot circle in the SVG actually aligns with the mouse physical click
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseOut = () => {
      setIsVisible(false);
      setIsClicked(false);
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      if (document.head.contains(styleBlock)) document.head.removeChild(styleBlock);
      document.body.style.cursor = "auto";
    };
  }, [cursorX, cursorY, isVisible]);

  if (isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[999999]"
      style={{ x: cursorX, y: cursorY, opacity: isVisible ? 1 : 0 }}
    >
      <EggPointerSVG isHovering={isHovering} isClicked={isClicked} />
    </motion.div>
  );
}
