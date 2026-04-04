"use client";

import { useState } from "react";
import { useGame } from "../../app/game/GameContext";
import { useRouter } from "next/navigation";
import { playSound } from "@/utils/sound";

function getWarrenNumber(scene: string): number {
  if (scene === "overworld" || scene === "battle") return 1;
  if (scene === "level2_stealth") return 2;
  if (scene === "level3_runner") return 3;
  if (scene === "level4_forge") return 4;
  if (scene === "level5_boss") return 5;
  return 0;
}

export default function GameHUD() {
  const { scene, gameClues, decryptedClueCount, timeRemaining, lives } = useGame();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("easter_muted") === "true";
    return false;
  });

  const currentWarren = getWarrenNumber(scene);

  if (scene === "ending") return null;

  const handleSettingsToggle = () => {
    playSound("ui_click");
    setSettingsOpen(prev => !prev);
    setResetConfirm(false);
  };

  const handleFullscreen = () => {
    playSound("ui_click");
    document.documentElement.requestFullscreen().catch(() => {});
    setSettingsOpen(false);
  };

  const handleMuteToggle = () => {
    playSound("ui_click");
    const next = !muted;
    setMuted(next);
    localStorage.setItem("easter_muted", String(next));
  };

  const handleResetSave = () => {
    if (!resetConfirm) {
      playSound("ui_click");
      setResetConfirm(true);
      return;
    }
    playSound("ui_click");
    localStorage.removeItem("easterBugSave");
    window.location.reload();
  };

  return (
    <>
    {/* Settings Modal — centered fixed overlay */}
    {settingsOpen && (
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={() => setSettingsOpen(false)}
      >
        <div
          className="bg-[#0A0A0A] border-2 border-easter-hotpink font-mono w-72 shadow-[0_0_40px_rgba(255,105,180,0.3)]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="text-easter-hotpink font-black tracking-widest text-sm uppercase">Settings</span>
            <button onClick={() => setSettingsOpen(false)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
          </div>
          <button
            onClick={handleFullscreen}
            className="w-full text-sm px-5 py-4 text-white/80 hover:bg-easter-hotpink/20 hover:text-white text-left tracking-widest uppercase border-b border-white/10 transition-colors"
          >
            ⛶ &nbsp;Fullscreen
          </button>
          <button
            onClick={handleMuteToggle}
            className="w-full text-sm px-5 py-4 text-white/80 hover:bg-easter-hotpink/20 hover:text-white text-left tracking-widest uppercase border-b border-white/10 transition-colors"
          >
            {muted ? "♪ Unmute" : "✕ Mute"}
          </button>
          <button
            onClick={handleResetSave}
            className={`w-full text-sm px-5 py-4 text-left tracking-widest uppercase transition-colors ${resetConfirm ? 'text-red-400 hover:bg-red-500/20' : 'text-white/80 hover:bg-white/5 hover:text-white'}`}
          >
            {resetConfirm ? "⚠ Confirm Reset?" : "↺ Reset Save"}
          </button>
        </div>
      </div>
    )}

    <div className="fixed inset-0 p-6 flex justify-between items-start z-[100] pointer-events-none mix-blend-difference text-white">

      {/* Left side: Terminal Log */}
      <div className="flex flex-col gap-1 font-mono text-sm font-bold uppercase tracking-widest pointer-events-auto">
        <span className="opacity-50">SPRING.ACTIVE // COLOUR_CARRIER</span>
        <span>WARREN: {scene === 'level2_stealth' ? 'THE HOLLOW WARREN' : scene === 'level3_runner' ? 'THE GREAT TUMBLE' : scene === 'level4_forge' ? 'THE FACTORY FLOOR' : scene === 'level5_boss' ? 'THE GREY THRONE' : 'THE HIDDEN GARDEN'}</span>
      </div>

      {scene === 'overworld' && (
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 max-w-xs xl:max-w-md pointer-events-auto mix-blend-normal z-[110]">
          {gameClues && gameClues.map((clue, idx) => {
            const isDecrypted = idx < decryptedClueCount;
            return (
              <div key={idx} className={`p-2 lg:p-3 text-[10px] md:text-xs font-mono brutal-border ${isDecrypted ? 'bg-[#050505]/95 border-easter-green text-easter-green shadow-[0_0_15px_rgba(50,205,50,0.3)]' : 'bg-black/60 border-white/10 text-white/30 blur-[1px]'}`}>
                {isDecrypted ? `[REVEALED]: ${clue}` : `[SEALED] DEFEAT A GUARDIAN TO REVEAL`}
              </div>
            );
          })}
        </div>
      )}

      {/* Right side: Warren Pips + Timer & Settings */}
      <div className="flex flex-col items-end gap-4 pointer-events-auto mix-blend-normal">

        {/* Warren Progress Pips */}
        {currentWarren > 0 && (
          <div className="flex gap-2 items-center">
            <span className="font-mono text-[10px] text-white/40 mr-1 tracking-widest">WARREN</span>
            {[1, 2, 3, 4, 5].map(n => {
              const completed = n < currentWarren;
              const current = n === currentWarren;
              return (
                <div
                  key={n}
                  className={`w-3 h-4 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border transition-all
                    ${completed ? 'bg-easter-hotpink border-easter-hotpink shadow-[0_0_8px_#FF69B4]' :
                      current ? 'bg-easter-hotpink border-white shadow-[0_0_12px_#FF69B4] animate-pulse scale-110' :
                      'bg-transparent border-white/30'}`}
                />
              );
            })}
          </div>
        )}

        {scene !== 'level_complete' && scene !== 'gameover' && (
          <div className="flex gap-6 pointer-events-none">
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs text-white/50">TIME LIMIT</span>
              <span className={`font-mono text-3xl font-black ${timeRemaining <= 10 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                {timeRemaining}s
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs text-white/50">LIVES</span>
              <div className="flex gap-2 mt-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-easter-green shadow-[0_0_10px_#32CD32]' : 'border border-white/20'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom row: Escape + Settings */}
        <div className="flex gap-2 items-center relative">
          <button
            onClick={() => router.push('/')}
            className="font-mono text-sm font-bold border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            // ESCAPE
          </button>

          {/* Settings Gear */}
          <button
            onClick={handleSettingsToggle}
            className="font-mono text-lg font-bold border border-white/50 w-9 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </div>

    </div>
    </>
  );
}
