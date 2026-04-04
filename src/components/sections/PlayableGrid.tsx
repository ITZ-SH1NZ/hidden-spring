"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── CSS Sprites ───────────────────────────────────────────────────────────────

const PlayerSprite = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="absolute top-0 left-[28%] w-[18%] h-[38%] rounded-t-full" style={{ background: '#FFF', border: '2px solid #000' }} />
    <div className="absolute top-0 right-[28%] w-[18%] h-[38%] rounded-t-full" style={{ background: '#FFF', border: '2px solid #000' }} />
    <div className="absolute bottom-0 left-[10%] w-[80%] h-[65%] rounded-[50%_50%_50%_50%/40%_40%_60%_60%]" style={{ background: '#FFF', border: '2px solid #000' }} />
    <div className="absolute rounded-full" style={{ width: '14%', height: '14%', background: '#FF69B4', bottom: '42%', left: '28%' }} />
    <div className="absolute rounded-full" style={{ width: '14%', height: '14%', background: '#FF69B4', bottom: '42%', right: '28%' }} />
  </div>
);

const EggSprite = ({ cracked, isSpring, colorIdx }: { cracked: boolean; isSpring: boolean; colorIdx: number }) => {
  const colors = ['#FF69B4', '#87CEEB', '#DDA0DD', '#98FB98'];
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="w-[70%] h-[85%] rounded-[50%_50%_50%_50%/60%_60%_40%_40%]"
        style={{
          background: cracked ? (isSpring ? 'radial-gradient(circle,#FFD700,#FF8C00)' : '#444') : colors[colorIdx % 4],
          border: '2px solid #000',
          opacity: cracked ? 0.5 : 1,
          boxShadow: cracked && isSpring ? '0 0 10px #FFD700' : 'none',
          transition: 'background 0.3s, opacity 0.3s',
        }}
      />
      {cracked && (
        <div className="absolute font-black text-white" style={{ fontSize: 10, textShadow: '0 1px 2px #000' }}>
          {isSpring ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};

const GuardianSprite = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <div className="absolute top-0 left-[26%] w-[18%] h-[35%] rounded-t-full" style={{ background: '#666', border: '2px solid #000' }} />
    <div className="absolute top-0 right-[26%] w-[18%] h-[35%] rounded-t-full" style={{ background: '#666', border: '2px solid #000' }} />
    <div className="absolute bottom-0 left-[8%] w-[84%] h-[65%] rounded-[50%_50%_50%_50%/40%_40%_60%_60%]" style={{ background: '#888', border: '2px solid #000' }} />
    <div className="absolute rounded-full" style={{ width: '14%', height: '14%', background: '#FF0000', bottom: '42%', left: '26%' }} />
    <div className="absolute rounded-full" style={{ width: '14%', height: '14%', background: '#FF0000', bottom: '42%', right: '26%' }} />
  </div>
);

// ── Map ───────────────────────────────────────────────────────────────────────

const MAP_TEMPLATE = [
  "WWWWWWWWWWWWW",
  "W...........W",
  "W.WW.W.WW..EW",
  "W...........W",
  "W.W.WW.W.X..W",
  "W...........W",
  "W.WW...WW.E.W",
  "W..P........W",
  "W.W.WW..W.W.W",
  "W...E.......W",
  "W.WW..WW..E.W",
  "W...........W",
  "WWWWWWWWWWWWW",
];

const COLS = MAP_TEMPLATE[0].length;
const ROWS = MAP_TEMPLATE.length;
const CELL = 36;

interface EggCell { row: number; col: number; isSpring: boolean; cracked: boolean; colorIdx: number; }
interface GuardPos { row: number; col: number; dir: number; }

function buildMap() {
  const floors: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const eggs: EggCell[] = [];
  let playerStart = { row: 7, col: 3 };

  let eggIdx = 0;
  MAP_TEMPLATE.forEach((row, r) => {
    row.split("").forEach((ch, c) => {
      if (ch !== "W") floors[r][c] = true;
      if (ch === "P") playerStart = { row: r, col: c };
      if (ch === "E") { eggs.push({ row: r, col: c, isSpring: false, cracked: false, colorIdx: eggIdx++ }); }
      if (ch === "X") { eggs.push({ row: r, col: c, isSpring: true,  cracked: false, colorIdx: eggIdx++ }); }
    });
  });

  const guards: GuardPos[] = [
    { row: 2, col: 6, dir: 0 },
    { row: 8, col: 6, dir: 1 },
  ];

  return { floors, eggs, playerStart, guards };
}

const { floors, eggs: INIT_EGGS, playerStart: PLAYER_START, guards: INIT_GUARDS } = buildMap();
const DIRS = [{ r: 0, c: 1 }, { r: 0, c: -1 }, { r: 1, c: 0 }, { r: -1, c: 0 }];

type Phase = "IDLE" | "PLAYING" | "WIN" | "LOSE";

export default function PlayableGrid() {
  const [phase, setPhase] = useState<Phase>("IDLE");
  const [player, setPlayer] = useState(PLAYER_START);
  const [eggs, setEggs] = useState<EggCell[]>(INIT_EGGS.map(e => ({ ...e })));
  const [guards, setGuards] = useState<GuardPos[]>(INIT_GUARDS.map(g => ({ ...g })));
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [msg, setMsg] = useState("");
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashMsg = (text: string) => {
    setMsg(text);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(""), 1800);
  };

  const reset = () => {
    setPlayer(PLAYER_START);
    setEggs(INIT_EGGS.map(e => ({ ...e })));
    setGuards(INIT_GUARDS.map(g => ({ ...g })));
    setLives(3);
    setTimeLeft(60);
    setMsg("");
    setPhase("IDLE");
  };

  // Timer
  useEffect(() => {
    if (phase !== "PLAYING") return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setPhase("LOSE"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Guardian patrol
  useEffect(() => {
    if (phase !== "PLAYING") return;
    const t = setInterval(() => {
      setGuards(prev => prev.map(g => {
        let d = g.dir;
        let nr = g.row + DIRS[d].r;
        let nc = g.col + DIRS[d].c;
        if (!floors[nr]?.[nc]) {
          d = (d + 1) % 4;
          nr = g.row + DIRS[d].r;
          nc = g.col + DIRS[d].c;
        }
        if (!floors[nr]?.[nc]) { nr = g.row; nc = g.col; }
        return { row: nr, col: nc, dir: d };
      }));
    }, 550);
    return () => clearInterval(t);
  }, [phase]);

  // Collision with guardians
  useEffect(() => {
    if (phase !== "PLAYING") return;
    const hit = guards.some(g => g.row === player.row && g.col === player.col);
    if (!hit) return;
    setPlayer(PLAYER_START);
    flashMsg("CAUGHT BY A GREY GUARDIAN!");
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) setPhase("LOSE");
      return next;
    });
  }, [guards]);

  const move = useCallback((dr: number, dc: number) => {
    if (phase !== "PLAYING") return;
    setPlayer(prev => {
      const nr = prev.row + dr;
      const nc = prev.col + dc;
      if (!floors[nr]?.[nc]) return prev;
      return { row: nr, col: nc };
    });
  }, [phase]);

  const crackEgg = useCallback(() => {
    if (phase !== "PLAYING") return;
    setEggs(prev => {
      let acted = false;
      const next = prev.map(egg => {
        if (egg.cracked || acted) return egg;
        const dist = Math.abs(egg.row - player.row) + Math.abs(egg.col - player.col);
        if (dist > 1) return egg;
        acted = true;
        if (egg.isSpring) {
          setPhase("WIN");
          flashMsg("SPRING EGG FOUND!");
        } else {
          flashMsg("HOLLOW EGG! -1 LIFE");
          setLives(l => {
            const next = l - 1;
            if (next <= 0) setPhase("LOSE");
            return next;
          });
        }
        return { ...egg, cracked: true };
      });
      return next;
    });
  }, [phase, player]);

  // Keyboard input
  useEffect(() => {
    if (phase === "IDLE") return;
    const handler = (e: KeyboardEvent) => {
      if (["ArrowUp","KeyW"].includes(e.code))    { e.preventDefault(); move(-1, 0); }
      if (["ArrowDown","KeyS"].includes(e.code))  { e.preventDefault(); move(1, 0); }
      if (["ArrowLeft","KeyA"].includes(e.code))  { e.preventDefault(); move(0, -1); }
      if (["ArrowRight","KeyD"].includes(e.code)) { e.preventDefault(); move(0, 1); }
      if (e.code === "Space")                     { e.preventDefault(); crackEgg(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, move, crackEgg]);

  const timerColor = timeLeft <= 10 ? '#FF4444' : timeLeft <= 20 ? '#FFD700' : '#98FB98';
  const nearEgg = phase === "PLAYING" && eggs.some(e => !e.cracked && Math.abs(e.row - player.row) + Math.abs(e.col - player.col) <= 1);

  return (
    <section id="play-demo" className="relative w-full py-24 bg-[#1A1A1A] border-y-[8px] border-black flex flex-col items-center justify-center min-h-[80vh] overflow-hidden z-20">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-easter-green opacity-5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-6 text-center text-white relative z-10 px-4">
        <span className="px-4 py-1 border-2 border-easter-hotpink text-easter-hotpink rounded-full font-bold uppercase text-xs tracking-[0.2em] mb-3 inline-block">Warren 1 Demo</span>
        <h2 className="text-[clamp(2rem,4vw,4rem)] font-black tracking-tighter leading-none drop-shadow-[0_4px_0_#FF69B4] uppercase">The Hidden Garden</h2>
        <p className="text-gray-400 font-bold text-sm mt-2 max-w-sm mx-auto">Find the Spring Egg. Avoid the Grey Guardians. You have 3 lives.</p>
      </div>

      {/* HUD */}
      <div className="relative z-10 flex items-center gap-6 mb-4 font-mono text-sm font-black select-none">
        <span>
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} style={{ color: i < lives ? '#FF69B4' : '#333', fontSize: '1.2rem' }}>♥</span>
          ))}
        </span>
        <span style={{ color: timerColor, minWidth: 36 }}>{timeLeft}s</span>
        <span className="text-white/30 hidden md:inline">[ARROWS] move · [SPACE] crack egg</span>
      </div>

      {/* Canvas */}
      <div
        className="relative z-10 select-none"
        style={{ border: '4px solid #000', boxShadow: '6px 6px 0 #FF69B4', overflow: 'hidden', borderRadius: 24 }}
      >
        {/* Static grid layer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
            background: '#0D0A06',
            position: 'relative',
          }}
        >
          {MAP_TEMPLATE.map((row, r) =>
            row.split("").map((ch, c) => {
              const isWall = ch === "W";
              const egg = eggs.find(e => e.row === r && e.col === c);
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: CELL, height: CELL,
                    background: isWall ? '#2A1F12' : (r + c) % 2 === 0 ? '#111008' : '#0D0A06',
                    borderRight: isWall ? '1px solid #3A2A18' : undefined,
                    borderBottom: isWall ? '1px solid #3A2A18' : undefined,
                    position: 'relative',
                  }}
                >
                  {egg && <EggSprite cracked={egg.cracked} isSpring={egg.isSpring} colorIdx={egg.colorIdx} />}
                </div>
              );
            })
          )}

          {/* Guardians — absolutely positioned, CSS transition */}
          {guards.map((g, i) => (
            <div
              key={`guard-${i}`}
              style={{
                position: 'absolute',
                width: CELL, height: CELL,
                top: g.row * CELL,
                left: g.col * CELL,
                transition: 'top 0.18s linear, left 0.18s linear',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <GuardianSprite />
            </div>
          ))}

          {/* Player — absolutely positioned, CSS transition */}
          <div
            style={{
              position: 'absolute',
              width: CELL, height: CELL,
              top: player.row * CELL,
              left: player.col * CELL,
              transition: 'top 0.1s ease-out, left 0.1s ease-out',
              zIndex: 3,
            }}
          >
            <PlayerSprite />
            {nearEgg && (
              <div style={{
                position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                background: '#FFD700', color: '#000', fontSize: 8, fontWeight: 900,
                padding: '1px 5px', border: '1px solid #000', borderRadius: 3, whiteSpace: 'nowrap',
              }}>
                SPACE
              </div>
            )}
          </div>
        </div>

        {/* Overlay: IDLE */}
        {phase === "IDLE" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm" style={{ zIndex: 10 }}>
            <div className="text-center px-6">
              <div className="text-easter-hotpink font-black text-2xl tracking-widest mb-2 uppercase">Warren 1</div>
              <div className="text-white/60 text-sm mb-6 max-w-[220px] mx-auto">5 eggs buried. 1 is the Spring Egg. Crack the wrong ones and lose a life.</div>
              <button
                onClick={() => setPhase("PLAYING")}
                className="px-8 py-3 bg-easter-hotpink text-black font-black uppercase tracking-widest text-sm border-[3px] border-black hover:-translate-y-1 transition-transform"
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                Enter The Garden
              </button>
            </div>
          </div>
        )}

        {/* Overlay: WIN / LOSE */}
        {(phase === "WIN" || phase === "LOSE") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm" style={{ zIndex: 10 }}>
            <div className="text-center px-6">
              {phase === "WIN" ? (
                <>
                  <div className="text-5xl mb-2" style={{ filter: 'drop-shadow(0 0 16px #FFD700)' }}>🥚</div>
                  <div className="text-easter-yellow font-black text-xl tracking-widest mb-1 uppercase">Spring Egg Found!</div>
                  <div className="text-white/50 text-xs mb-6">The warren cracks open.</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">💀</div>
                  <div className="text-red-400 font-black text-xl tracking-widest mb-1 uppercase">Grey King Wins</div>
                  <div className="text-white/50 text-xs mb-6">{timeLeft === 0 ? "Time ran out." : "All lives spent."}</div>
                </>
              )}
              <button
                onClick={reset}
                className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-sm border-[3px] border-black hover:-translate-y-1 transition-transform"
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating message */}
      {msg && (
        <div
          className="fixed bottom-8 left-1/2 z-50 pointer-events-none font-black uppercase tracking-widest text-sm px-6 py-3"
          style={{
            transform: 'translateX(-50%)',
            background: '#1A1A1A', border: '3px solid #FF69B4',
            color: '#FF69B4', boxShadow: '4px 4px 0 #000',
          }}
        >
          {msg}
        </div>
      )}

      {/* Mobile controls */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 md:hidden select-none">
        <button onPointerDown={() => move(-1, 0)} className="w-12 h-12 bg-white/10 border-2 border-white/30 text-white font-black text-lg active:bg-white/20 flex items-center justify-center">↑</button>
        <div className="flex gap-2">
          <button onPointerDown={() => move(0, -1)} className="w-12 h-12 bg-white/10 border-2 border-white/30 text-white font-black text-lg active:bg-white/20 flex items-center justify-center">←</button>
          <button onPointerDown={crackEgg} className="w-12 h-12 bg-easter-hotpink/80 border-2 border-easter-hotpink text-black font-black text-[10px] active:bg-easter-hotpink flex items-center justify-center" style={{ boxShadow: '2px 2px 0 #000' }}>CRACK</button>
          <button onPointerDown={() => move(0, 1)} className="w-12 h-12 bg-white/10 border-2 border-white/30 text-white font-black text-lg active:bg-white/20 flex items-center justify-center">→</button>
        </div>
        <button onPointerDown={() => move(1, 0)} className="w-12 h-12 bg-white/10 border-2 border-white/30 text-white font-black text-lg active:bg-white/20 flex items-center justify-center">↓</button>
      </div>
    </section>
  );
}
