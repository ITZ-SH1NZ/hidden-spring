"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const DEADZONE = 12; // px — minimum drag before a direction is registered
const TILE_REPEAT_DELAY = 180; // ms — how long to wait before auto-repeating for tile-based games

export default function MobileJoypad() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Key helpers ────────────────────────────────────────────────────────────
  const fireKey = useCallback((key: string, code: string, isDown: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(isDown ? "keydown" : "keyup", {
        key, code, bubbles: true, cancelable: true,
      })
    );
  }, []);

  // ─── Joystick state ─────────────────────────────────────────────────────────
  const joystickOriginRef = useRef<{ x: number; y: number } | null>(null);
  const activeDirectionRef = useRef<string | null>(null); // current held direction key
  const thumbRef = useRef<HTMLDivElement>(null);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRepeat = () => {
    if (repeatTimerRef.current) { clearTimeout(repeatTimerRef.current); repeatTimerRef.current = null; }
    if (repeatIntervalRef.current) { clearInterval(repeatIntervalRef.current); repeatIntervalRef.current = null; }
  };

  const releaseDirection = useCallback(() => {
    clearRepeat();
    if (activeDirectionRef.current) {
      const key = activeDirectionRef.current;
      const codeMap: Record<string, string> = {
        ArrowUp: "ArrowUp", ArrowDown: "ArrowDown",
        ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight",
      };
      fireKey(key, codeMap[key], false);
      activeDirectionRef.current = null;
    }
    // Reset thumb visual
    if (thumbRef.current) {
      thumbRef.current.style.transform = "translate(-50%, -50%)";
    }
  }, [fireKey]);

  const applyDirection = useCallback((key: string) => {
    const codeMap: Record<string, string> = {
      ArrowUp: "ArrowUp", ArrowDown: "ArrowDown",
      ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight",
    };
    // If direction changed, release the old one first
    if (activeDirectionRef.current && activeDirectionRef.current !== key) {
      fireKey(activeDirectionRef.current, codeMap[activeDirectionRef.current], false);
      clearRepeat();
      activeDirectionRef.current = null;
    }

    if (activeDirectionRef.current !== key) {
      activeDirectionRef.current = key;
      // Fire immediately
      fireKey(key, codeMap[key], true);
      // After initial delay, start auto-repeat for tile-based games
      repeatTimerRef.current = setTimeout(() => {
        repeatIntervalRef.current = setInterval(() => {
          fireKey(key, codeMap[key], true);
        }, TILE_REPEAT_DELAY);
      }, TILE_REPEAT_DELAY);
    }
  }, [fireKey]);

  // ─── Joystick touch handlers ────────────────────────────────────────────────
  const onJoystickStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    joystickOriginRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const onJoystickMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!joystickOriginRef.current) return;

    const { x: ox, y: oy } = joystickOriginRef.current;
    const dx = e.clientX - ox;
    const dy = e.clientY - oy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Clamp thumb visual to 32px radius
    const maxThumb = 32;
    const clampedDist = Math.min(dist, maxThumb);
    const angle = Math.atan2(dy, dx);
    if (thumbRef.current) {
      const tx = Math.cos(angle) * clampedDist;
      const ty = Math.sin(angle) * clampedDist;
      thumbRef.current.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
    }

    if (dist < DEADZONE) {
      releaseDirection();
      return;
    }

    // Determine direction from angle
    // atan2 returns: right=0, down=π/2, left=±π, up=-π/2
    const deg = angle * (180 / Math.PI);
    let dir: string;
    if (deg > -45 && deg <= 45) dir = "ArrowRight";
    else if (deg > 45 && deg <= 135) dir = "ArrowDown";
    else if (deg > -135 && deg <= -45) dir = "ArrowUp";
    else dir = "ArrowLeft";

    applyDirection(dir);
  }, [applyDirection, releaseDirection]);

  const onJoystickEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    joystickOriginRef.current = null;
    releaseDirection();
  }, [releaseDirection]);

  // ─── Action button ───────────────────────────────────────────────────────────
  const actionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onActionStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    fireKey(" ", "Space", true);
    actionIntervalRef.current = setInterval(() => {
      fireKey(" ", "Space", true);
    }, 200);
  }, [fireKey]);

  const onActionEnd = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (actionIntervalRef.current) { clearInterval(actionIntervalRef.current); actionIntervalRef.current = null; }
    fireKey(" ", "Space", false);
  }, [fireKey]);

  if (!mounted) return null;

  return (
    <div className="md:hidden flex w-full h-full bg-[#0A0A0A] p-4 items-center justify-between pointer-events-auto touch-none select-none border-t-2 border-white/10">

      {/* Left side: Analog Joystick */}
      <div
        className="relative w-32 h-32 rounded-full bg-white/5 border-2 border-white/15 flex items-center justify-center cursor-none"
        onPointerDown={onJoystickStart}
        onPointerMove={onJoystickMove}
        onPointerUp={onJoystickEnd}
        onPointerCancel={onJoystickEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Thumb */}
        <div
          ref={thumbRef}
          className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 pointer-events-none"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        {/* Direction hints */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-white/20 font-bold pointer-events-none">▲</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-white/20 font-bold pointer-events-none">▼</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-bold pointer-events-none">◀</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-white/20 font-bold pointer-events-none">▶</span>
      </div>

      {/* Right side: Action button */}
      <div className="flex flex-col items-center justify-end space-y-2 h-full pb-2">
        <span className="text-[10px] text-white/30 tracking-widest">[ ACTION ]</span>
        <div
          className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 active:bg-easter-green active:border-easter-green flex items-center justify-center select-none"
          onPointerDown={onActionStart}
          onPointerUp={onActionEnd}
          onPointerLeave={onActionEnd}
          onPointerCancel={onActionEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="w-4 h-4 rounded-full bg-white/50 pointer-events-none" />
        </div>
      </div>

    </div>
  );
}
