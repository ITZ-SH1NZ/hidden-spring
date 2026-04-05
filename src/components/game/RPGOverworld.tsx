"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../../app/game/GameContext";
import { playSound } from "@/utils/sound";

// 0: Floor
// 1: Wall
// 3: Boss 1 (The Sentinel)
// 4: Boss 2 (The Glitch)
// 5: Boss 3 (The Firewall)
// 6: Egg Spawn Point
const TILE_SIZE = 64; // px

const OVERWORLD_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,6,1,0,0,0,1,0,0,0,1,6,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,1,0,1,3,1,0,1,0,0,0,1,0,1,5,1,0,1,1],
  [1,0,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,1,1,1,1,0,1,6,1,0,0,1],
  [1,1,1,1,1,1,1,0,1,6,1,0,1,0,1,0,1,0,1,1],
  [1,6,1,0,0,0,0,0,1,0,1,0,1,0,1,4,1,0,1,1],
  [1,0,1,0,1,1,1,0,1,3,1,0,1,0,0,0,0,0,1,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAP_HEIGHT = OVERWORLD_MAP.length;
const MAP_WIDTH = OVERWORLD_MAP[0].length;

export default function RPGOverworld() {
  const { playerPos, setPlayerPos, setScene, startBattle, showDialog, loseLife, defeatedEnemies, checkedEggs, markEggChecked, setGameClues, gameClues, correctEggId, setCorrectEggId } = useGame();
  
  const [activeEnemies, setActiveEnemies] = useState<{x:number, y:number, type:number, id:string}[]>([]);
  const [activeEggs, setActiveEggs] = useState<{x:number, y:number, id:string, isCorrect:boolean}[]>([]);

  useEffect(() => {
    // Generate entities
    const enemies = [];
    const eggs = [];
    
    for (let r = 0; r < MAP_HEIGHT; r++) {
      for (let c = 0; c < MAP_WIDTH; c++) {
        const val = OVERWORLD_MAP[r][c];
        const eId = `enemy-${r}-${c}`;
        if (val >= 3 && val <= 5 && !defeatedEnemies.includes(eId)) {
          enemies.push({ x: c, y: r, type: val, id: eId });
        }
        const eggId = `egg-${r}-${c}`;
        if (val === 6 && !checkedEggs.includes(eggId)) {
          eggs.push({ x: c, y: r, id: eggId, isCorrect: false });
        }
      }
    }
    
    // Pick 1 random correct egg
    let correctEgg = null;
    if (eggs.length > 0) {
      if (correctEggId) {
        // We already know which egg is correct from previous load
        const match = eggs.find(e => e.id === correctEggId);
        if (match) {
           match.isCorrect = true;
           correctEgg = match;
        }
      } else {
        // Need to pick a correct egg
        const unusedEggs = eggs.filter(e => !checkedEggs.includes(e.id));
        if (unusedEggs.length > 0) {
           const luckyIndex = Math.floor(Math.random() * unusedEggs.length);
           unusedEggs[luckyIndex].isCorrect = true;
           correctEgg = unusedEggs[luckyIndex];
           setCorrectEggId(unusedEggs[luckyIndex].id);
        }
      }
    }
    
    // Generate Clues ONLY on fresh run
    if (gameClues.length === 0 && correctEgg) {
       const clues = [];
       
       // Clue 1: Broad Compass Direction
       if (correctEgg.y <= 3) clues.push("The Spring Egg rests in the far Northern reaches of the Warren.");
       else if (correctEgg.x > 12) clues.push("The Spring Egg is located on the Eastern border of the maze.");
       else if (correctEgg.x < 5) clues.push("The Spring Egg is located on the far Western edge.");
       else clues.push("The Spring Egg is hidden right in the Center of the garden ruins.");

       // Clue 2: Precise Landmark Context
       if (correctEgg.x === 5 && correctEgg.y === 1) clues.push("It is tucked inside a narrow upper-left alcove.");
       else if (correctEgg.x === 15 && correctEgg.y === 1) clues.push("It sits in the uppermost right corner of the ruins.");
       else if (correctEgg.x === 15 && correctEgg.y === 6) clues.push("You must navigate the winding eastern labyrinth paths to find it.");
       else if (correctEgg.x === 9 && correctEgg.y === 7) clues.push("It is heavily surrounded by a thick block of protective walls.");
       else if (correctEgg.x === 1 && correctEgg.y === 8) clues.push("It lies crushed directly against the harsh western boundary wall.");
       else clues.push("It is completely obscured by the surrounding maze geometry.");

       // Clue 3: Boss Proximity Danger
       if (correctEgg.x < 10 && correctEgg.y < 5) clues.push("Beware: The Sentinel patrols very close to its location.");
       else if (correctEgg.x > 10 && correctEgg.y < 5) clues.push("Beware: The Firewall rigidly guards the perimeter around it.");
       else if (correctEgg.x > 10 && correctEgg.y >= 5) clues.push("Beware: The Glitch actively corrupts the data nearby.");
       else if (correctEgg.x === 9 && correctEgg.y === 7) clues.push("Beware: You must slip stealthily between multiple boss domains to reach the center.");
       else clues.push("Beware: You may have to face multiple guardians to reach its isolated path.");

       setGameClues(clues);
    }
    
    setActiveEnemies(enemies);
    setActiveEggs(eggs);
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    let dx = 0;
    let dy = 0;
    let dir: "up" | "down" | "left" | "right" = playerPos.dir;

    if (e.key === "w" || e.key === "ArrowUp") { dy = -1; dir = "up"; }
    else if (e.key === "s" || e.key === "ArrowDown") { dy = 1; dir = "down"; }
    else if (e.key === "a" || e.key === "ArrowLeft") { dx = -1; dir = "left"; }
    else if (e.key === "d" || e.key === "ArrowRight") { dx = 1; dir = "right"; }
    
    if (e.key === " ") {
      interact();
      return;
    }

    if (dx !== 0 || dy !== 0) {
      const nx = playerPos.x + dx;
      const ny = playerPos.y + dy;

      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT) {
        if (OVERWORLD_MAP[ny][nx] !== 1) { // 1 is wall
          
          // Check collision with boss
          const enemyIdx = activeEnemies.findIndex(en => en.x === nx && en.y === ny);
          if (enemyIdx !== -1) {
            const type = activeEnemies[enemyIdx].type;
            let enemyMeta = { name: "Drone", hp: 30, color: "#FF0044", mechanic: "normal" };
            if (type === 3) enemyMeta = { name: "The Hollow Hare", hp: 60, color: "#AAAAAA", mechanic: "tank" };
            if (type === 4) enemyMeta = { name: "The Rot", hp: 30, color: "#7FBF3F", mechanic: "evade" };
            if (type === 5) enemyMeta = { name: "The Frost Shell", hp: 40, color: "#88CCFF", mechanic: "drain" };

            playSound("ui_click");
            startBattle({
              id: activeEnemies[enemyIdx].id,
              name: enemyMeta.name,
              maxHp: enemyMeta.hp,
              hp: enemyMeta.hp,
              sprite: "boss",
              color: enemyMeta.color,
              mechanic: enemyMeta.mechanic
            });
            
            // Remove enemy temporarily from map, ideally should be permanent unlss lost
            const newEnemies = [...activeEnemies];
            newEnemies.splice(enemyIdx, 1);
            setActiveEnemies(newEnemies);
            return;
          }

          // Move player
          playSound("move");
          setPlayerPos({ x: nx, y: ny, dir });
        }
      } else {
        setPlayerPos({ ...playerPos, dir });
      }
    }
  };

  const interact = () => {
    // Check player tile and all adjacent tiles (+ radius)
    const checkRadius = [
      {x: playerPos.x, y: playerPos.y},    // center
      {x: playerPos.x, y: playerPos.y-1},  // up
      {x: playerPos.x, y: playerPos.y+1},  // down
      {x: playerPos.x-1, y: playerPos.y},  // left
      {x: playerPos.x+1, y: playerPos.y},  // right
    ];

    let foundEggIndex = -1;
    for (let point of checkRadius) {
       foundEggIndex = activeEggs.findIndex(egg => egg.x === point.x && egg.y === point.y);
       if (foundEggIndex !== -1) break;
    }

    if (foundEggIndex !== -1) {
      const egg = activeEggs[foundEggIndex];
      // Interact with egg
      if (egg.isCorrect) {
        playSound("crack_good");
        showDialog("SPRING EGG FOUND! THE WARREN CRACKS OPEN.");
        setTimeout(() => setScene("level_complete"), 2000);
      } else {
        playSound("crack_bad");
        loseLife();
        markEggChecked(egg.id);
        const newEggs = [...activeEggs];
        newEggs.splice(foundEggIndex, 1);
        setActiveEggs(newEggs);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, activeEnemies, activeEggs]); 

  // Center camera on player
  const windowHalfW = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const windowHalfH = typeof window !== 'undefined' ? window.innerHeight / 2 : 500;
  const cameraX = windowHalfW - (playerPos.x * TILE_SIZE + TILE_SIZE/2);
  const cameraY = windowHalfH - (playerPos.y * TILE_SIZE + TILE_SIZE/2);

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      
      {/* World Container */}
      <motion.div 
        className="absolute top-0 left-0"
        animate={{ x: cameraX, y: cameraY }}
        transition={{ type: "tween", ease: "linear", duration: 0.15 }}
      >
        {/* Draw Map */}
        {OVERWORLD_MAP.map((row, r) => (
          row.map((tile, c) => (
            <div 
              key={`tile-${r}-${c}`}
              className="absolute flex items-center justify-center border border-white/5"
              style={{
                width: TILE_SIZE, height: TILE_SIZE,
                left: c * TILE_SIZE, top: r * TILE_SIZE,
                backgroundColor: tile === 1 ? "#1A1A1A" : "transparent"
              }}
            >
               {tile === 1 && (
                 <div className="w-[90%] h-[90%] border-t-2 border-l-2 border-white/10 rounded-tl-sm" />
               )}
            </div>
          ))
        ))}

        {/* Draw Enemies */}
        {activeEnemies.map(en => (
          <div
            key={en.id}
            className="absolute z-10 flex items-center justify-center pointer-events-none"
            style={{ width: TILE_SIZE, height: TILE_SIZE, left: en.x * TILE_SIZE, top: en.y * TILE_SIZE }}
          >
            {/* The Hollow Hare — grey bunny, hollow eyes */}
            {en.type === 3 && (
              <div className="relative w-10 h-12 animate-pulse" style={{ filter: "drop-shadow(0 0 8px #AAAAAA)" }}>
                <div className="absolute top-0 left-[3px] w-[9px] h-[18px] bg-[#666] border border-white/30 rounded-t-full" />
                <div className="absolute top-0 right-[3px] w-[9px] h-[18px] bg-[#666] border border-white/30 rounded-t-full" />
                <div className="absolute bottom-0 w-10 h-8 bg-[#888] border border-white/20" />
                <div className="absolute bottom-3 left-[5px] w-[7px] h-[7px] bg-black border border-white/50" />
                <div className="absolute bottom-3 right-[5px] w-[7px] h-[7px] bg-black border border-white/50" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-white/40" />
              </div>
            )}
            {/* The Rot — cracked dark egg, glowing fissure */}
            {en.type === 4 && (
              <div className="relative w-9 h-10 animate-pulse" style={{ filter: "drop-shadow(0 0 8px #7FBF3F)" }}>
                <div className="absolute inset-0 bg-[#1A2A10] border border-[#7FBF3F]/60 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" />
                <div className="absolute top-2 left-1/2 w-[2px] h-5 bg-[#7FBF3F] rotate-[10deg] -translate-x-1/2" />
                <div className="absolute top-4 left-[30%] w-[2px] h-3 bg-[#7FBF3F]/60 rotate-[-20deg]" />
                <div className="absolute top-2 left-[7px] w-[6px] h-[6px] rounded-full bg-[#7FBF3F]" />
                <div className="absolute top-2 right-[7px] w-[6px] h-[6px] rounded-full bg-[#7FBF3F]" />
                <div className="absolute bottom-1 left-1/3 w-[4px] h-2 bg-[#7FBF3F]/50 rounded-b-full" />
              </div>
            )}
            {/* The Frost Shell — spiky icy egg */}
            {en.type === 5 && (
              <div className="relative w-10 h-10 flex items-center justify-center animate-pulse" style={{ filter: "drop-shadow(0 0 8px #88CCFF)" }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[4px] h-3 bg-[#88CCFF]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-3 bg-[#88CCFF]" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[4px] bg-[#88CCFF]" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-[4px] bg-[#88CCFF]" />
                <div className="absolute inset-[10px] rounded-full bg-[#071520] border-2 border-[#88CCFF]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#88CCFF]" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Draw Eggs */}
        {activeEggs.map(egg => (
          <div 
            key={egg.id}
            className="absolute z-10 flex items-center justify-center pointer-events-none"
            style={{ width: TILE_SIZE, height: TILE_SIZE, left: egg.x * TILE_SIZE, top: egg.y * TILE_SIZE }}
          >
            <div className="w-6 h-8 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-easter-yellow brutal-border animate-pulse drop-shadow-[0_0_10px_#FFD700]" />
          </div>
        ))}

        {/* Draw Player */}
        <motion.div 
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          style={{ width: TILE_SIZE, height: TILE_SIZE }}
          animate={{ left: playerPos.x * TILE_SIZE, top: playerPos.y * TILE_SIZE }}
          transition={{ type: "tween", ease: "linear", duration: 0.15 }}
        >
           <div className={`relative w-8 h-10 ${playerPos.dir === 'left' ? '-scale-x-100' : ''}`}>
             <div className="absolute bottom-0 w-8 h-8 bg-easter-hotpink rounded-t-lg rounded-b-md drop-shadow-[0_0_15px_#FF69B4] brutal-border border-white overflow-hidden">
                <div className="absolute top-2 w-full flex justify-around px-1">
                   <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                   <div className="w-1.5 h-2.5 bg-white rounded-full animate-pulse" />
                </div>
             </div>
             <div className="absolute top-[-8px] left-[2px] w-2 h-4 bg-easter-hotpink rounded-t-full border border-white" />
             <div className="absolute top-[-8px] right-[2px] w-2 h-4 bg-easter-hotpink rounded-t-full border border-white" />
           </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
