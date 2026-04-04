"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../app/game/GameContext";

export default function BattleScreen() {
  const { currentEnemy, playerHp, playerMaxHp, takeDamage, endBattle, heal, timeRemaining, addCharge, resetCharge, ultimateCharge } = useGame();
  
  const [enemyHp, setEnemyHp] = useState(currentEnemy?.maxHp || 50);
  const [turn, setTurn] = useState<"player" | "enemy" | "end">("player");
  const [log, setLog] = useState<string[]>(["ENCOUNTER INITIATED: " + currentEnemy?.name]);
  
  // Animation states
  const [playerAnim, setPlayerAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  const [shieldActive, setShieldActive] = useState(false);

  // Sync enemy HP exactly to the fresh currentEnemy when combat starts
  useEffect(() => {
    if (currentEnemy) {
      setEnemyHp(currentEnemy.hp);
    }
  }, [currentEnemy]);

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 4));
  };

  const handlePlayerAction = (action: "strike" | "bomb" | "shield" | "glitch") => {
    if (turn !== "player") return;

    if (action === "strike") {
      setPlayerAnim("attack");
      addCharge();
      addLog("> You strike with the Carrot Blade.");
      setTimeout(() => {
        const dmg = Math.floor(Math.random() * 10) + 20; // 20-30 dmg
        setEnemyHp(prev => Math.max(0, prev - dmg));
        setEnemyAnim("hurt");
        addLog(`>> ${currentEnemy?.name} took ${dmg} DMG.`);
        checkStateAfterPlayerTurn(dmg);
      }, 500);
    } 
    else if (action === "bomb") {
      setPlayerAnim("attack");
      addCharge();
      addLog("> You hurl a heavy Plasma Yolk.");
      setTimeout(() => {
        const hits = Math.random() > 0.3;
        if (hits) {
          const dmg = Math.floor(Math.random() * 15) + 35; // 35-50 dmg
          setEnemyHp(prev => Math.max(0, prev - dmg));
          setEnemyAnim("hurt");
          addLog(`>> ${currentEnemy?.name} took a direct hit: ${dmg} DMG.`);
          checkStateAfterPlayerTurn(dmg);
        } else {
          addLog(">> The Plasma Yolk missed its target.");
          checkStateAfterPlayerTurn(0);
        }
      }, 500);
    } 
    else if (action === "shield") {
      setShieldActive(true);
      addLog("> You raised the Egg Shield.");
      setTimeout(() => checkStateAfterPlayerTurn(0), 500);
    }
    else if (action === "glitch") {
      if (ultimateCharge < 3) {
         addLog("> ERROR: INSUFFICIENT ENERGY FOR GLITCH.");
         return;
      }
      resetCharge();
      setPlayerAnim("magic");
      addLog("> You hack the local matrix...");
      setTimeout(() => {
         const success = Math.random() > 0.3;
         if (success) {
          if (currentEnemy?.mechanic === "evade" && Math.random() > 0.5) {
             setEnemyAnim("hurt"); // they evaded actually
             addLog(`>> ${currentEnemy.name} EVADED the Glitch!`);
             checkStateAfterPlayerTurn(0);
          } else {
             const dmg = 80;
             setEnemyHp(prev => Math.max(0, prev - dmg));
             setEnemyAnim("huge_hurt");
             addLog(`>> CRITICAL GLITCH! ${dmg} DMG.`);
             checkStateAfterPlayerTurn(dmg);
          }
         } else {
           addLog(`>> Hack failed. Backfire!`);
           takeDamage(10);
           checkStateAfterPlayerTurn(0);
         }
      }, 800);
    }
    
    setTurn("enemy");
  };

  const checkStateAfterPlayerTurn = (dmgDealt: number) => {
    // Rely on current state snapshot (React batches updates but closures trap old values, so we approximate or use effect. Since we used functional update for enemyHp, we can't reliably read it here synchronously. We will use useEffect for death checking.)
  };

  useEffect(() => {
    if (enemyHp <= 0 && turn !== "end") {
      setTurn("end");
      addLog(">> THREAT NEUTRALIZED.");
      setTimeout(() => endBattle(true), 2000);
    }
  }, [enemyHp, turn, endBattle]);

  useEffect(() => {
    if (playerHp <= 0 && turn !== "end") {
      setTurn("end");
      addLog(">> CRITICAL FAILURE. SYSTEM DOWN.");
      setTimeout(() => endBattle(false), 2000);
    }
  }, [playerHp, turn, endBattle]);

  useEffect(() => {
    if (turn === "enemy" && enemyHp > 0 && playerHp > 0) {
      setTimeout(() => {
        setEnemyAnim("attack");
        addLog(`> ${currentEnemy?.name} executes [SWEEP]`);
        
        setTimeout(() => {
          let dmg = Math.floor(Math.random() * 5) + 5; // 5-10 dmg
          if (shieldActive) {
            dmg = Math.floor(dmg / 3);
            addLog(`>> Shield absorbed impact. Took ${dmg} DMG.`);
          } else {
            addLog(`>> You took ${dmg} DMG.`);
          }
          takeDamage(dmg);
          setPlayerAnim("hurt");
          setShieldActive(false);
          
          if (playerHp - dmg > 0) {
            setTurn("player");
          }
        }, 500);
      }, 1000);
    }
  }, [turn, enemyHp, playerHp, shieldActive, currentEnemy, takeDamage]);

  // Reset animations
  useEffect(() => {
    if (playerAnim) setTimeout(() => setPlayerAnim(""), 400);
    if (enemyAnim) setTimeout(() => setEnemyAnim(""), 400);
  }, [playerAnim, enemyAnim]);

  return (
    <motion.div 
      className="absolute inset-0 bg-[#0A0A0A] flex flex-col z-50 font-mono"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Arena */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(255,0,68,0.15)_100%)] pointer-events-none" />
      <div className="absolute top-0 w-full h-[50vh] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_20px]" />

      <div className="flex-1 flex flex-col md:flex-row items-center justify-between px-4 md:px-[10vw] relative pt-[10vh] md:pt-[20vh] pb-4">
        
        {/* Player Sprite */}
        <div className="relative w-32 md:w-48 h-32 md:h-48 flex items-end justify-center transform scale-75 md:scale-100">
          <motion.div 
            className="w-24 h-32"
            animate={
              playerAnim === "attack" ? { x: [0, 100, 0], scale: 1.2 } :
              playerAnim === "magic" ? { y: [0, -40, 0], filter: ["hue-rotate(0deg)", "hue-rotate(180deg)", "hue-rotate(0deg)"] } :
              playerAnim === "hurt" ? { x: [-10, 10, -10, 10, 0], filter: "brightness(2)" } : {}
            }
            transition={{ duration: 0.3 }}
          >
             {/* The Easter Bug (Player) */}
             <div className="relative w-full h-full">
               <div className="absolute bottom-0 w-full h-2/3 bg-easter-hotpink drop-shadow-[0_0_20px_#FF69B4] rounded-t-2xl brutal-border border-white flex flex-col items-center justify-center">
                  <div className="flex gap-4 mb-2">
                    <div className="w-2 h-4 bg-white animate-pulse" />
                    <div className="w-2 h-4 bg-white animate-pulse" />
                  </div>
                  {shieldActive && <div className="absolute -inset-4 border-4 border-easter-blue rounded-full opacity-50 animate-ping" />}
               </div>
               <div className="absolute top-[-10px] left-[15%] w-4 h-12 bg-easter-hotpink border-2 border-white rounded-t-full" />
               <div className="absolute top-[-10px] right-[15%] w-4 h-12 bg-easter-hotpink border-2 border-white rounded-t-full" />
             </div>
          </motion.div>
        </div>

        {/* Enemy Sprite */}
        <div className="relative w-32 md:w-48 h-32 md:h-48 flex items-end justify-center transform scale-75 md:scale-100">
          <motion.div 
            className="w-32 h-32"
            animate={
               enemyAnim === "attack" ? { x: [0, -100, 0], scale: 1.2 } :
               enemyAnim === "hurt" ? { x: [10, -10, 10, -10, 0], filter: "invert(1)" } : 
               enemyAnim === "huge_hurt" ? { scale: [1, 1.5, 0.8, 1], rotate: [0, 15, -15, 0], filter: ["blur(0px)", "blur(10px)", "blur(0px)"] } : {}
            }
            transition={{ duration: 0.3 }}
          >
            {/* The Drone (Enemy) */}
            <div className={`relative w-full h-full bg-[${currentEnemy?.color || '#FF0044'}] brutal-border drop-shadow-[0_0_30px_#FF0044] rotate-45 flex items-center justify-center`}>
               <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full animate-ping" />
               </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Battle UI (Bottom Half) */}
      <div className="h-auto min-h-[40vh] border-t-4 border-white/20 bg-black flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 relative z-10 overflow-y-auto">
         
         {/* Stats */}
         <div className="flex-1 border-2 border-white/20 p-4 brutal-shadow flex flex-col gap-4">
            <div>
               <div className="text-white/50 text-xs mb-1">PLAYER STATUS</div>
               <div className="flex justify-between items-end mb-1">
                 <span className="text-xl font-bold">THE BUG</span>
                 <span>{playerHp}/{playerMaxHp}</span>
               </div>
               <div className="w-full h-4 border border-white/30 bg-black">
                 <motion.div className="h-full bg-easter-green" animate={{ width: `${(playerHp/playerMaxHp)*100}%` }} />
               </div>
            </div>
            
            <div className="mt-auto">
               <div className="text-white/50 text-xs mb-1">TARGET STATUS</div>
               <div className="flex justify-between items-end mb-1">
                 <span className="text-xl font-bold text-[#FF0044]">{currentEnemy?.name}</span>
                 <span className="text-[#FF0044]">{enemyHp}/{currentEnemy?.maxHp}</span>
               </div>
               <div className="w-full h-2 border border-white/30 bg-black">
                 <motion.div className="h-full bg-white" style={{ backgroundColor: currentEnemy?.color || "#FF0044" }} animate={{ width: `${(enemyHp/(currentEnemy?.maxHp || 1))*100}%` }} />
               </div>
            </div>
         </div>

         {/* Actions Menu */}
         <div className="flex-1 flex flex-col gap-4">
            <div className="text-white/50 text-xs text-center border-b border-white/20 pb-2">
              COMMAND MATRIX {turn === "player" ? "[AWAITING INPUT]" : "[PROCESSING...]"}
            </div>
            
            {/* Charge Bar */}
            <div className="flex justify-center gap-2 mb-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className={`w-8 h-2 border border-easter-purple ${i <= ultimateCharge ? 'bg-easter-purple drop-shadow-[0_0_10px_#9B5DE5]' : 'bg-transparent'} transition-colors`} />
               ))}
               <span className="font-mono text-[10px] text-white/50 ml-2">GLITCH CHARGE</span>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <button 
                onClick={() => handlePlayerAction("strike")}
                disabled={turn !== "player"}
                className={`border-2 border-white uppercase font-bold text-lg tracking-widest ${turn === "player" ? "hover:bg-white hover:text-black" : "opacity-30 cursor-not-allowed"} transition-colors`}
              >
                SWORD
              </button>
              <button 
                onClick={() => handlePlayerAction("bomb")}
                disabled={turn !== "player"}
                className={`border-2 border-easter-hotpink text-easter-hotpink uppercase font-bold text-lg tracking-widest ${turn === "player" ? "hover:bg-easter-hotpink hover:text-white" : "opacity-30 cursor-not-allowed"} transition-colors`}
              >
                YOLK BOMB
              </button>
              <button 
                 onClick={() => handlePlayerAction("shield")}
                 disabled={turn !== "player"}
                 className={`border-2 border-white uppercase font-bold text-lg tracking-widest ${turn === "player" ? "hover:bg-white hover:text-black" : "opacity-30 cursor-not-allowed"} transition-colors`}
              >
                SHIELD
              </button>
              <button 
                 onClick={() => handlePlayerAction("glitch")}
                 disabled={turn !== "player" || ultimateCharge < 3}
                 className={`border-2 ${ultimateCharge >= 3 ? 'border-easter-purple text-easter-purple hover:bg-easter-purple hover:text-white drop-shadow-[0_0_10px_#9B5DE5] animate-pulse' : 'border-white/20 text-white/20 grayscale cursor-not-allowed'} uppercase font-bold text-lg tracking-widest transition-all relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(155,93,229,0.2),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                GLITCH
              </button>
            </div>
         </div>

          {/* Text Log */}
         <div className="flex-1 border-2 border-white/20 bg-white/5 p-4 overflow-hidden flex flex-col justify-end min-h-[150px]">
            <div className="flex flex-col gap-2">
              {log.map((entry, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1 - (i * 0.25), x: 0 }} 
                  className={`text-sm ${i === 0 ? 'text-white' : 'text-white/50'}`}
                >
                  {entry}
                </motion.div>
              )).reverse()}
            </div>
         </div>

      </div>
    </motion.div>
  );
}
