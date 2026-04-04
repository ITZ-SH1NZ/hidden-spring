"use client";

import { useState, useEffect, useRef } from "react";
import { useGame } from "@/app/game/GameContext";
import { playSound } from "@/utils/sound";

interface Projectile {
  id: number;
  x: number;
  y: number;
  isEnemy: boolean;
}

export default function Level5Boss() {
  const { setScene, showDialog, loseLife, dialogInfo, devBossPhase } = useGame();

  const initPhase = devBossPhase ?? 1;
  const [phase, setPhase] = useState(initPhase);
  const [playerX, setPlayerX] = useState(50);
  const [bossHp, setBossHp] = useState(initPhase === 1 ? 15 : 0);
  const [bossX, setBossX] = useState(50);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  
  // Fighter State
  const [fighterState, setFighterState] = useState<"IDLE" | "TELEGRAPH_LEFT" | "TELEGRAPH_RIGHT" | "TELEGRAPH_CENTER" | "STRIKE" | "STUNNED">("IDLE");
  const [bossPhase2Hp, setBossPhase2Hp] = useState(initPhase > 2 ? 0 : 100);
  const [dmgPopups, setDmgPopups] = useState<{id: number, text: string}[]>([]);
  const [phase4TextIdx, setPhase4TextIdx] = useState(-1);
  const lockCounterRef = useRef(false);
  const [flash, setFlash] = useState(false);
  const [bossHitOverlay, setBossHitOverlay] = useState(false);
  const [bossRage, setBossRage] = useState(false);
  const [dodgeIndicator, setDodgeIndicator] = useState(false);
  const [counterHitAnim, setCounterHitAnim] = useState(false);
  const [bossDefeatedAnim, setBossDefeatedAnim] = useState(false);

  const requestRef = useRef<number>(0);
  const pRef = useRef({ x: 50, phase: initPhase, bossHp: initPhase === 1 ? 15 : 0, bossPhase2Hp: initPhase > 2 ? 0 : 100 });
  const bRef = useRef({ x: 50, spreadCount: 0 });
  const projRef = useRef<Projectile[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const lastShot = useRef(0);
  const lastBossShot = useRef(0);
  const lastHit = useRef(0);
  const dialogActiveRef = useRef(false);
  const attackSeqRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to refs
  useEffect(() => { dialogActiveRef.current = dialogInfo.show; }, [dialogInfo.show]);
  useEffect(() => { pRef.current.phase = phase; }, [phase]);
  useEffect(() => { pRef.current.x = playerX; }, [playerX]);
  // bossHp is written directly to pRef in the game loop — no sync effect needed

  // Keys Tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      keys.current[e.code] = true;
      
      // Fighter counter attack
      if (pRef.current.phase === 2 && (e.code === "Space" || e.key === " ")) {
        if (fighterState === "STUNNED" && !lockCounterRef.current) {
           lockCounterRef.current = true;
           const dmg = Math.floor(Math.random() * 11) + 15; // 15 to 25
           const newHp = Math.max(0, pRef.current.bossPhase2Hp - dmg);
           setBossPhase2Hp(newHp);
           pRef.current.bossPhase2Hp = newHp;
           
           // Floating popup
           const popId = Date.now();
           setDmgPopups(prev => [...prev, { id: popId, text: `-${dmg}%` }]);
           setTimeout(() => { setDmgPopups(prev => prev.filter(p => p.id !== popId)); }, 1000);
           
           // Visual Hit indicator
           setCounterHitAnim(true);
           setTimeout(() => setCounterHitAnim(false), 300);

           if (newHp <= 0) {
              clearTimeout(attackSeqRef.current as any);
              playSound("boss_phase");
              setBossDefeatedAnim(true);
              setFighterState("IDLE");
              setTimeout(() => {
                 setPhase(3); // Golden Egg Drop Phase
                 setPlayerX(10);
                 pRef.current.x = 10;
              }, 3000);
           } else {
              setFighterState("IDLE");
           }
           setTimeout(() => { lockCounterRef.current = false; }, 300); // 300ms counter cooldown
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [fighterState, phase]);

  // Game Loop (Shooter Phase & Movement)
  useEffect(() => {
    if (phase === 1.5 || phase === 4) return;

    let time = 0;
    const loop = (t: number) => {
      requestRef.current = requestAnimationFrame(loop);
      if (dialogActiveRef.current) return;
      time = t;

      // Move player
      let dx = 0;
      if (keys.current["ArrowLeft"] || keys.current["a"]) dx = -1;
      if (keys.current["ArrowRight"] || keys.current["d"]) dx = 1;
      const speed = pRef.current.phase === 2 ? 4.5 : 1.5;
      if (dx !== 0) setPlayerX(x => Math.max(5, Math.min(95, x + dx * speed)));

      if (pRef.current.phase === 3) {
         // Egg collection check
         if (Math.abs(pRef.current.x - 50) < 10) {
            setPhase(4);
            setTimeout(() => setPhase4TextIdx(0), 4000);
         }
      }

      if (pRef.current.phase === 1) {
          // Move Boss (sine wave tracking)
          const targetBossX = 50 + Math.sin(time / 1000) * 35;
          setBossX(targetBossX);
          bRef.current.x = targetBossX;

      // Player Shoot
      if ((keys.current["Space"] || keys.current[" "]) && time - lastShot.current > 300) {
         projRef.current.push({ id: time, x: pRef.current.x, y: 80, isEnemy: false });
         lastShot.current = time;
         playSound("shoot");
      }

      // Boss Shoot
      const rageMult = pRef.current.bossHp < 5 ? 0.6 : 1.0;
      const fireRate = pRef.current.bossHp < 5 ? 600 : 1000;
      if (time - lastBossShot.current > fireRate * rageMult) {
         projRef.current.push({ id: time + 1, x: bRef.current.x, y: 14, isEnemy: true }); // y:14 correctly maps to bottom of Boss container top[10%]
         if (pRef.current.bossHp <= 5 && bRef.current.spreadCount < 3) { 
            // Spread shot for 3 rounds max at half health
            projRef.current.push({ id: time + 2, x: bRef.current.x - 8, y: 14, isEnemy: true });
            projRef.current.push({ id: time + 3, x: bRef.current.x + 8, y: 14, isEnemy: true });
            bRef.current.spreadCount++;
         }
         lastBossShot.current = time;
      }

      // Move Projectiles
      projRef.current.forEach(p => {
         p.y += p.isEnemy ? 1.5 : -3;
      });

      // Collisions
      const activeProj = [];
      let nextPhaseTrigger = false;
      for (const p of projRef.current) {
         if (p.y < 0 || p.y > 100) continue;
         
         let hit = false;
         if (!p.isEnemy && Math.abs(p.y - 10) < 6 && Math.abs(p.x - bRef.current.x) < 10) {
            pRef.current.bossHp = Math.max(0, pRef.current.bossHp - 2);
            setBossHp(pRef.current.bossHp);
            playSound("boss_hit");
            if (pRef.current.bossHp <= 0) {
               nextPhaseTrigger = true;
            }
            hit = true;
            setBossHitOverlay(true);
            setTimeout(() => setBossHitOverlay(false), 100);
         }
         if (p.isEnemy && Math.abs(p.y - 90) < 5 && Math.abs(p.x - pRef.current.x) < 5) {
            if (time - lastHit.current > 1000) {
               loseLife();
               playSound("boss_hit");
               hit = true;
               setFlash(true);
               lastHit.current = time;
               setTimeout(() => setFlash(false), 200);
            }
         }
         
         if (!hit) activeProj.push(p);
      }
      projRef.current = activeProj;
      setProjectiles([...activeProj]);

      if (nextPhaseTrigger && pRef.current.phase === 1) {
         setProjectiles([]);
         projRef.current = [];
         setPhase(1.5);
         playSound("boss_phase");
         showDialog("SHELL CRACKED.\nTHE GREY KING DESCENDS.", "system");
      }
      } // End Phase 1 logic block
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [phase]);

  // Phase 2 AI Logic
  useEffect(() => {
     if (phase !== 2) return;

     const startAttack = () => {
        if (pRef.current.phase !== 2) return;
        
        setFighterState("IDLE");
        const r = Math.random();
        let move: "LEFT" | "RIGHT" | "CENTER" | "TRICK_L" | "TRICK_R" = "LEFT";
        if (r > 0.8) move = "TRICK_L";
        else if (r > 0.6) move = "TRICK_R";
        else if (r > 0.4) move = "CENTER";
        else if (r > 0.2) move = "RIGHT";

        const timing = Math.max(1000, 1800 - ((100 - pRef.current.bossPhase2Hp) * 8));

        attackSeqRef.current = setTimeout(() => {
           if (move === "CENTER") setFighterState("TELEGRAPH_CENTER");
           else if (move.startsWith("TRICK_")) setFighterState(move === "TRICK_L" ? "TELEGRAPH_RIGHT" : "TELEGRAPH_LEFT");
           else setFighterState(move === "LEFT" ? "TELEGRAPH_LEFT" : "TELEGRAPH_RIGHT");
           
           attackSeqRef.current = setTimeout(() => {
              if (move.startsWith("TRICK_")) {
                 setFighterState(move === "TRICK_L" ? "TELEGRAPH_LEFT" : "TELEGRAPH_RIGHT");
                 setFlash(true); 
                 setTimeout(() => setFlash(false), 150);
                 
                 // Provide 800ms physical window for player to run back across the arena
                 attackSeqRef.current = setTimeout(executeStrike, 800);
              } else {
                 executeStrike();
              }

              function executeStrike() {
                 setFighterState("STRIKE");
                 setBossRage(true);
                 
                 const px = pRef.current.x;
                 let safe = false;
                 if (move === "CENTER") safe = px < 20 || px > 80;
                 else if (move === "LEFT" || move === "TRICK_L") safe = px > 60;
                 else safe = px < 40;
                 
                 if (!safe) {
                    if (Date.now() - lastHit.current > 1000) {
                        loseLife();
                        lastHit.current = Date.now();
                        showDialog("STRUCK DOWN BY THE GREY KING.", "system");
                    }
                 } else {
                    setFighterState("STUNNED");
                    setDodgeIndicator(true);
                    setTimeout(() => setDodgeIndicator(false), 800);
                 }

                 attackSeqRef.current = setTimeout(() => {
                    setBossRage(false);
                    startAttack();
                 }, 1000);
              }
           }, timing);
        }, 1500);
     };

     startAttack();
     return () => clearTimeout(attackSeqRef.current as any);
  }, [phase]);


  return (
    <div className={`absolute inset-0 bg-[#050505] flex items-center justify-center font-mono overflow-hidden transition-colors ${flash ? 'bg-white invert' : ''}`}>
       
       {phase === 1 && (
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_2px,transparent_2px)] bg-[size:100%_40px] border-x-4 border-red-500/20 max-w-4xl mx-auto pointer-events-none">
          
          {/* Boss Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-4 border border-red-500 bg-black">
             <div className="h-full bg-red-500 transition-all" style={{ width: `${(bossHp / 15) * 100}%` }} />
          </div>

          {/* Boss Entity — The Grey King */}
          <div className="absolute top-[10%] w-28 h-32 -translate-x-1/2 flex items-center justify-center" style={{ left: `${bossX}%` }}>
             <div className="relative w-full h-full" style={{ filter: `drop-shadow(0 0 ${bossHp < 8 ? '40px' : '20px'} #EF4444)` }}>
                {/* Crown spikes */}
                <div className="absolute top-0 left-[10%] w-[14%] h-[28%] bg-[#333] border border-red-500/60" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                <div className="absolute top-0 left-[38%] w-[24%] h-[36%] bg-[#222] border border-red-500" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                <div className="absolute top-0 right-[10%] w-[14%] h-[28%] bg-[#333] border border-red-500/60" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                {/* Crown base */}
                <div className="absolute top-[24%] left-0 right-0 h-[10%] bg-[#222] border-x border-red-500/60" />
                {/* Body */}
                <div className="absolute top-[32%] left-[5%] right-[5%] bottom-0 bg-[#111] border-2 border-red-500/80" />
                {/* Eyes */}
                <div className={`absolute w-[16%] h-[14%] bg-red-500 ${bossHp < 8 ? 'animate-ping' : 'animate-pulse'}`} style={{ top: '40%', left: '18%' }} />
                <div className={`absolute w-[16%] h-[14%] bg-red-500 ${bossHp < 8 ? 'animate-ping' : 'animate-pulse'}`} style={{ top: '40%', right: '18%' }} />
                {/* Scowl */}
                <div className="absolute h-[4%] bg-red-500/70" style={{ bottom: '18%', left: '20%', right: '20%' }} />
                {/* Crack overlay when low HP */}
                {bossHp < 8 && (
                  <>
                    <div className="absolute top-[35%] left-[45%] w-[2px] h-[40%] bg-red-500/80 rotate-[15deg]" />
                    <div className="absolute top-[45%] left-[30%] w-[2px] h-[25%] bg-red-500/50 rotate-[-10deg]" />
                  </>
                )}
             </div>
          </div>

          {/* Projectiles */}
          {projectiles.map(p => (
             <div 
               key={p.id}
               className={`absolute w-3 h-8 -translate-x-1/2 -translate-y-1/2 ${p.isEnemy ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 'bg-easter-green shadow-[0_0_10px_#32CD32]'}`}
               style={{ left: `${p.x}%`, top: `${p.y}%` }}
             />
          ))}

          {/* Player */}
          <div 
             className="absolute bottom-[10%] w-12 h-16 -translate-x-1/2"
             style={{ left: `${playerX}%` }}
          >
             <div className="w-full h-full bg-easter-green rounded-t-lg rounded-b-md drop-shadow-[0_0_15px_#32CD32] border border-white relative">
                 <div className="absolute top-2 w-full flex justify-around px-1">
                    <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                    <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                 </div>
                 <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-2 h-4 bg-easter-green" />
             </div>
          </div>
       </div>
       )}

       {phase === 1.5 && (
       <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 z-50 animate-in fade-in zoom-in-95 duration-500">
           <div className="text-white text-center font-mono max-w-lg space-y-6 brutal-border border-white/20 p-8 bg-[#050505]">
              <div className="text-white/50 tracking-[0.2em] mb-8 animate-pulse">[ GREY KING ALERT ]</div>
              
              <div className="text-easter-green font-black text-xl md:text-2xl tracking-widest min-h-[120px] flex items-center justify-center">
                {storyIndex === 0 && "The Grey King has shed his armour. He descends to crush you himself."}
                {storyIndex === 1 && "DODGE his strikes by moving into the safe zone OPPOSITE of his Telegraph."}
                {storyIndex === 2 && "WARNING: The Centre Smash strikes the entire floor! Sprint to the extreme edges to survive!"}
                {storyIndex === 3 && "WARNING: The Grey King is cunning. He may feint his telegraph direction at the last second!"}
                {storyIndex === 4 && "When the Grey King flashes [ ! STUN ! ], press SPACE to counter-strike. Drain his HP to 0%."}
              </div>

              <button 
                 className="mt-12 px-6 py-4 border-2 border-white text-white font-black tracking-widest hover:bg-white hover:text-black transition-colors min-w-[200px]"
                 onClick={() => {
                    if (storyIndex < 4) {
                        setStoryIndex(s => s + 1);
                    } else {
                        setPhase(2);
                    }
                 }}
              >
                  {storyIndex < 4 ? "[ CONTINUE ]" : "[ ENGAGE ]"}
              </button>
           </div>
       </div>
       )}

       {phase === 2 && (
       <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8">
          <div className="text-white/50 animate-pulse absolute top-8 left-8 text-xs pointer-events-none">[ THE GREY KING DESCENDS ]</div>
          
          {/* Centered Phase 2 Health Bar */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center w-64 pointer-events-none">
             <div className="text-red-500 font-black mb-2 tracking-widest text-sm">BOSS INTEGRITY: {bossPhase2Hp}%</div>
             <div className="w-full h-2 bg-black border border-red-500 rounded-full overflow-hidden shadow-[0_0_15px_#EF4444]">
                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${bossPhase2Hp}%` }} />
             </div>
          </div>

          <div className={`relative w-full max-w-md h-[70vh] border-x-4 border-white/5 flex items-center justify-center overflow-hidden transition-all duration-300 ${fighterState === "STUNNED" ? 'border-easter-green shadow-[0_0_50px_#32CD32_inset]' : ''}`}>
             
             {/* Massive Stun Overlay Indicator */}
             {fighterState === "STUNNED" && (
                 <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120%] text-center text-4xl md:text-5xl font-black text-white bg-easter-green/80 animate-pulse py-4 z-40 brutal-border border-white scale-110 -rotate-3">
                    [ COUNTER NOW ]
                 </div>
             )}

             {/* Boss Fighter UI dynamically tracking X-axis */}
             <div className={`absolute transition-all duration-500 ease-out w-32 h-32 brutal-border border-red-500 z-10
                 ${bossDefeatedAnim ? 'animate-ping opacity-0 blur-xl scale-150 border-white bg-red-500/50' :
                   counterHitAnim ? 'bg-white invert scale-125 blur-[2px]' : 
                   fighterState === 'TELEGRAPH_LEFT' ? 'bg-red-900/50 scale-110 drop-shadow-[0_0_30px_#EF4444]' : 
                   fighterState === 'TELEGRAPH_RIGHT' ? 'bg-easter-purple/50 scale-110 drop-shadow-[0_0_30px_#9B5DE5]' : 
                   fighterState === 'TELEGRAPH_CENTER' ? 'bg-red-900/50 scale-125 drop-shadow-[0_0_50px_#EF4444]' :
                   fighterState === 'STRIKE' ? 'w-full h-full bg-red-600/80 drop-shadow-[0_0_50px_#EF4444] z-50' : 
                   fighterState === 'STUNNED' ? 'opacity-50 scale-95 grayscale' : 'bg-[#0A0A0A]'}`}
                 style={{
                    top: fighterState === 'STRIKE' ? '50%' : '30%', // Put down Boss lower
                    left: fighterState === 'TELEGRAPH_LEFT' ? '20%' : fighterState === 'TELEGRAPH_RIGHT' ? '80%' : '50%',
                    transform: 'translate(-50%, -50%)',
                 }}
             >
                {counterHitAnim && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                       <div className="w-[200%] h-4 bg-white rotate-45 shadow-[0_0_30px_#fff]" />
                       <div className="absolute w-[200%] h-4 bg-white -rotate-45 shadow-[0_0_30px_#fff]" />
                    </div>
                )}

                {dmgPopups.map((popup) => (
                    <div key={popup.id} className="absolute -top-12 text-red-500 font-black text-3xl animate-[flyUp_1s_ease-out_forwards] pointer-events-none">
                       {popup.text}
                    </div>
                ))}
                
                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-2xl tracking-[0.3em]">
                   {fighterState === "STUNNED" ? "! STUN !" : ""}
                </div>
             </div>
             <style>{`
                 @keyframes flyUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
                 }
             `}</style>
             
             <div className="absolute top-4 w-full flex justify-between px-8 text-xs text-white/50 uppercase">
                <span className={fighterState==='TELEGRAPH_LEFT' ? 'text-red-500 animate-ping' : ''}>[DANGER LEFT]</span>
                <span className={fighterState==='TELEGRAPH_RIGHT' ? 'text-easter-purple animate-ping' : ''}>[DANGER RIGHT]</span>
             </div>
             
             {/* Player Dodging */}
             <div className="absolute bottom-[20%] left-0 w-full h-16 flex items-end">
                <div 
                   className="absolute bottom-0 w-16 h-16 bg-easter-green transition-transform duration-75 brutal-border border-white drop-shadow-[0_0_15px_#32CD32] flex items-center justify-center z-50 origin-bottom"
                   style={{ 
                       left: `${playerX}%`, 
                       transform: `translateX(-50%) skewX(${playerX > 65 ? '15deg' : playerX < 35 ? '-15deg' : '0deg'}) scale(${fighterState === "STUNNED" ? '1.1' : '1'})` 
                   }}
                >
                   {dodgeIndicator && <div className="absolute -top-12 text-easter-green shadow-black font-black whitespace-nowrap animate-[flyUp_1s_ease-out_forwards] drop-shadow-md">DODGED!</div>}
                   {fighterState === "STUNNED" ? "SPACE!" : "#_#"}
                </div>
             </div>
             
             <div className="absolute top-4 w-full flex justify-between px-8 text-xs text-white/50 uppercase">
                <span className={fighterState==='TELEGRAPH_LEFT' ? 'text-red-500 animate-ping' : ''}>[DANGER LEFT]</span>
                <span className={fighterState==='TELEGRAPH_RIGHT' ? 'text-easter-purple animate-ping' : ''}>[DANGER RIGHT]</span>
             </div>
          </div>
          
          {/* Mobile overrides if they use Touch */}
          <div className="flex w-full justify-between max-w-sm mt-4">
             <button onClick={() => setPlayerX(20)} className="-ml-12 md:hidden bg-white/10 p-4 border border-white/20">DODGE L</button>
             <button onClick={() => setPlayerX(80)} className="-mr-12 md:hidden bg-white/10 p-4 border border-white/20">DODGE R</button>
          </div>
       </div>
       )}

       {phase === 3 && (
       <div className="absolute inset-0 bg-[#050505] overflow-hidden flex items-center justify-center pointer-events-none">
          <div className="absolute top-[20%] text-center opacity-50 text-xs tracking-[0.3em]">
             THE GREY KING FALLS.<br/><br/>THE GOLDEN EGG AWAITS.
          </div>
          
          <div className="absolute left-1/2 bottom-[20%] -translate-x-1/2 w-16 h-20" style={{ animation: 'eggDrop 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}>
             <style>{`
                 @keyframes eggDrop {
                    0% { transform: translate(-50%, -100vh) rotate(-180deg); opacity: 0; }
                    100% { transform: translate(-50%, 0) rotate(0deg); opacity: 1; }
                 }
             `}</style>
             <div className="w-full h-full bg-[linear-gradient(45deg,#FFD700,#FFA500,#FF8C00)] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-[0_0_50px_#FFD700] border-2 border-yellow-200 animate-pulse pointer-events-auto" />
          </div>

          {/* Player avatar freely moving to catch it */}
          <div 
             className="absolute bottom-[20%] w-12 h-16 -translate-x-1/2 transition-transform duration-75"
             style={{ left: `${playerX}%` }}
          >
             <div className="w-full h-full bg-easter-green rounded-t-lg rounded-b-md drop-shadow-[0_0_15px_#32CD32] border border-white" />
          </div>
       </div>
       )}

       {phase === 4 && (
       <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 overflow-hidden fade-in duration-1000 origin-center">
          
          {phase4TextIdx === -1 && (
             <>
               <div className="absolute top-[20%] text-center text-yellow-500 font-black tracking-[0.5em] animate-pulse">
                  CONNECTION ESTABLISHED
               </div>
               <div className="absolute transition-all duration-[4000ms] ease-in-out z-20" style={{ bottom: '15%', left: '50%', transform: 'translate(-50%, 0%)', animation: 'levitate 4s ease-in-out forwards' }}>
                  <div className="relative w-16 h-32">
                      {/* The Golden Egg locked in Ascending motion */}
                      <div className="absolute -top-12 left-0 w-16 h-20 bg-[linear-gradient(45deg,#FFD700,#FFA500,#FF8C00)] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-[0_0_100px_#FFD700] border-2 border-white/50 animate-pulse" />
                      {/* Player locked */}
                      <div className="absolute bottom-0 left-2 w-12 h-16 bg-white drop-shadow-[0_0_25px_#fff]" />
                  </div>
               </div>
             </>
          )}

          {phase4TextIdx >= 0 && (
             <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50">
                 <div className="text-black font-black text-2xl md:text-5xl text-center max-w-4xl space-y-16 tracking-[0.4em]">
                     {phase4TextIdx === 0 && <div className="animate-[textReveal_1.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards] opacity-0 blur-lg">THE GREY KING IS <span className="text-red-500 line-through decoration-red-500 underline-offset-8 drop-shadow-[0_0_15px_#EF4444]">DEFEATED.</span></div>}
                     {phase4TextIdx === 1 && <div className="animate-[textReveal_1.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards] opacity-0 blur-lg text-easter-purple drop-shadow-[0_0_15px_#9B5DE5]">THE GOLDEN EGG BLOOMS. COLOUR FLOODS THE WORLD.</div>}
                     {phase4TextIdx === 2 && <div className="animate-[textReveal_1.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards] opacity-0 blur-lg text-easter-green scale-110 drop-shadow-[0_0_20px_#32CD32] uppercase">Spring is free.<br/><br/>Expect colour.</div>}
                 </div>
                 
                 <button 
                    className="absolute bottom-[15%] px-10 py-4 border-4 border-black text-black font-black hover:bg-black hover:text-white transition-all hover:tracking-[0.3em] tracking-widest animate-pulse min-w-[250px]"
                    onClick={() => {
                        if (phase4TextIdx < 2) setPhase4TextIdx(p => p + 1);
                        else { playSound("win"); setScene("ending"); }
                    }}
                 >
                    {phase4TextIdx < 2 ? '[ NEXT EVENT ]' : '[ INITIALIZE PROTOCOL ]'}
                 </button>
             </div>
          )}
          
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,#FFD700,transparent)] pointer-events-none z-30 ${phase4TextIdx === -1 ? 'animate-[flashWhite_4s_ease-in_forwards]' : 'bg-white opacity-100'}`} />
          
          <style>{`
             @keyframes levitate {
                0% { bottom: 15%; scale: 1; }
                100% { bottom: 100%; scale: 0; }
             }
             @keyframes flashWhite {
                0% { opacity: 0; background-color: transparent; }
                85% { opacity: 1; background-color: white; }
                100% { opacity: 1; background-color: white; }
             }
             @keyframes textReveal {
                0% { filter: blur(20px); transform: translateY(30px) scale(0.9); opacity: 0; letter-spacing: 0em; }
                100% { filter: blur(0px); transform: translateY(0) scale(1); opacity: 1; letter-spacing: 0.4em; }
             }
          `}</style>
       </div>
       )}
    </div>
  );
}
