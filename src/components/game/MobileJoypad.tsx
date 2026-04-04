"use client";

import { useEffect, useState, useRef } from "react";

export default function MobileJoypad() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerKey = (key: string, code: string, isDown: boolean) => {
    const event = new KeyboardEvent(isDown ? "keydown" : "keyup", {
      key,
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const KeyButton = ({ label, k, code, className }: { label: string | React.ReactNode, k: string, code: string, className?: string }) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = (e: React.PointerEvent) => {
       e.preventDefault();
       // Fire immediately once
       triggerKey(k, code, true);
       // Then set interval for auto repeat like physical keys
       if (intervalRef.current) clearInterval(intervalRef.current);
       intervalRef.current = setInterval(() => {
          triggerKey(k, code, true);
       }, 50);
    };

    const stopHold = (e: React.PointerEvent) => {
       e.preventDefault();
       if (intervalRef.current) clearInterval(intervalRef.current);
       triggerKey(k, code, false);
    };

    return (
      <button
        className={`bg-white/10 border-2 border-white/20 active:bg-easter-green active:border-easter-green focus:outline-none select-none flex items-center justify-center transition-colors ${className}`}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        // Prevent context menu on long press
        onContextMenu={(e) => e.preventDefault()}
      >
        {label}
      </button>
    );
  };

  if (!mounted) return null;

  return (
    <div className="md:hidden flex w-full h-full bg-[#0A0A0A] p-4 items-center justify-between pointer-events-auto touch-none select-none border-t-2 border-white/10">
      
      {/* Left side: D-PAD */}
      <div className="relative w-32 h-32">
        <KeyButton k="ArrowUp" code="ArrowUp" label="W" className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 font-bold text-white/50" />
        <KeyButton k="ArrowDown" code="ArrowDown" label="S" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 font-bold text-white/50" />
        <KeyButton k="ArrowLeft" code="ArrowLeft" label="A" className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 font-bold text-white/50" />
        <KeyButton k="ArrowRight" code="ArrowRight" label="D" className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 font-bold text-white/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Right side: ACTION */}
      <div className="flex flex-col items-center justify-center space-y-2 h-full justify-end pb-2">
         <span className="text-[10px] text-white/30 tracking-widest">[ ACTION ]</span>
         <KeyButton 
            k=" " 
            code="Space" 
            label={<div className="w-4 h-4 rounded-full bg-white/50" />} 
            className="w-20 h-20 rounded-full !rounded-full text-xl" 
         />
      </div>

    </div>
  );
}
