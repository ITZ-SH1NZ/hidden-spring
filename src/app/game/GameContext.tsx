"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export type SceneType = "lore" | "lore2" | "lore3" | "lore4" | "lore5" | "overworld" | "battle" | "maze" | "level_complete" | "level2_stealth" | "level3_runner" | "level4_forge" | "level5_boss" | "ending" | "gameover";

export interface EnemyState {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  sprite: string;
  color: string;
  mechanic: string;
}

interface GameState {
  scene: SceneType;
  playerPos: { x: number; y: number; dir: "up" | "down" | "left" | "right" };
  playerHp: number;
  playerMaxHp: number;
  eggs: boolean[]; // Deprecated for Lvl 1 but kept for compatibility
  
  lives: number;
  timeRemaining: number;
  ultimateCharge: number;
  gameClues: string[];
  decryptedClueCount: number;
  correctEggId: string | null;
  
  dialogInfo: { show: boolean; text: string; speaker: "architect" | "system" | "none" };
  currentEnemy: EnemyState | null;

  defeatedEnemies: string[];
  checkedEggs: string[];

  devBossPhase: number;
  setDevBossPhase: (phase: number) => void;

  setScene: (scene: SceneType) => void;
  setPlayerPos: (pos: { x: number; y: number; dir: "up" | "down" | "left" | "right" }) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  loseLife: () => void;
  setLives: (lives: number) => void;
  markEnemyDefeated: (id: string) => void;
  markEggChecked: (id: string) => void;
  collectEgg: (index: number) => void;
  addCharge: () => void;
  resetCharge: () => void;
  setTimeRemaining: (time: number) => void;
  setGameClues: (clues: string[]) => void;
  setCorrectEggId: (id: string) => void;
  startBattle: (enemy: EnemyState) => void;
  endBattle: (won: boolean) => void;
  showDialog: (text: string, speaker?: "architect" | "system" | "none") => void;
  hideDialog: () => void;
}

const defaultState: GameState = {
  scene: "lore",
  playerPos: { x: 5, y: 5, dir: "down" },
  playerHp: 100,
  playerMaxHp: 100,
  eggs: [false, false, false, false, false],
  lives: 3,
  timeRemaining: 60,
  ultimateCharge: 0,
  gameClues: [],
  decryptedClueCount: 0,
  correctEggId: null,
  dialogInfo: { show: false, text: "", speaker: "none" },
  currentEnemy: null,
  
  defeatedEnemies: [],
  checkedEggs: [],
  devBossPhase: 1,
  setDevBossPhase: () => {},

  setScene: () => {},
  setPlayerPos: () => {},
  takeDamage: () => {},
  heal: () => {},
  loseLife: () => {},
  setLives: () => {},
  markEnemyDefeated: () => {},
  markEggChecked: () => {},
  collectEgg: () => {},
  addCharge: () => {},
  resetCharge: () => {},
  setTimeRemaining: () => {},
  setGameClues: () => {},
  setCorrectEggId: () => {},
  startBattle: () => {},
  endBattle: () => {},
  showDialog: () => {},
  hideDialog: () => {}
};

const GameContext = createContext<GameState>(defaultState);

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scene, setScene] = useState<SceneType>("lore");
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number; dir: "up" | "down" | "left" | "right" }>({ x: 10, y: 15, dir: "up" });
  const [playerHp, setPlayerHp] = useState(100);
  const [eggs, setEggs] = useState([false, false, false, false, false]);
  
  // Level 1 Specifics
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [ultimateCharge, setUltimateCharge] = useState(0);
  const [defeatedEnemies, setDefeatedEnemies] = useState<string[]>([]);
  const [checkedEggs, setCheckedEggs] = useState<string[]>([]);
  const [gameClues, setGameClues] = useState<string[]>([]);
  const [correctEggId, setCorrectEggId] = useState<string | null>(null);
  const [devBossPhase, setDevBossPhase] = useState(1);

  // Load from LocalStorage on mount
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("easterBugSave");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only restore if not gameover
        if (data.lives > 0 && data.timeRemaining > 0) {
          setScene(data.scene === "gameover" ? "lore" : data.scene);
          setPlayerPos(data.playerPos);
          setPlayerHp(data.playerHp);
          setEggs(data.eggs);
          setLives(data.lives);
          setTimeRemaining(data.timeRemaining);
          setUltimateCharge(data.ultimateCharge || 0);
          setDefeatedEnemies(data.defeatedEnemies || []);
          setCheckedEggs(data.checkedEggs || []);
          if (data.gameClues) setGameClues(data.gameClues);
          if (data.correctEggId) setCorrectEggId(data.correctEggId);
        }
      } catch (e) {
         console.error("Save corrupted");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isHydrated) {
      // Wipe logic
      if (lives <= 0) {
        localStorage.removeItem("easterBugSave");
      } else if (scene !== "gameover") {
        localStorage.setItem("easterBugSave", JSON.stringify({
          scene, playerPos, playerHp, eggs, lives, timeRemaining, ultimateCharge, defeatedEnemies, checkedEggs, gameClues, correctEggId
        }));
      }
    }
  }, [scene, playerPos, playerHp, eggs, lives, timeRemaining, ultimateCharge, defeatedEnemies, checkedEggs, gameClues, correctEggId, isHydrated]);

  const [dialogInfo, setDialogInfo] = useState<{ show: boolean; text: string; speaker: "architect" | "system" | "none" }>({ show: false, text: "", speaker: "none" });
  const [currentEnemy, setCurrentEnemy] = useState<EnemyState | null>(null);

  // Global Timer Effect
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (scene === "gameover" || scene === "ending" || scene === "lore" || scene === "lore2" || scene === "lore3" || scene === "lore4" || scene === "lore5" || scene === "level_complete") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const speed = scene === "battle" ? 2500 : 1000; // Slower in battle

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setScene("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scene]);

  useEffect(() => {
    if (lives <= 0) {
      setScene("gameover");
    }
  }, [lives]);

  const takeDamage = (amount: number) => setPlayerHp(prev => Math.max(0, prev - amount));
  const heal = (amount: number) => setPlayerHp(prev => Math.min(100, prev + amount));
  const loseLife = () => {
    setLives(prev => prev - 1);
  };
  
  const markEnemyDefeated = (id: string) => setDefeatedEnemies(prev => [...prev, id]);
  const markEggChecked = (id: string) => setCheckedEggs(prev => [...prev, id]);
  
  const addCharge = () => setUltimateCharge(prev => Math.min(3, prev + 1));
  const resetCharge = () => setUltimateCharge(0);

  const collectEgg = (index: number) => {
    setEggs((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const startBattle = (enemy: EnemyState) => {
    setCurrentEnemy(enemy);
    setScene("battle");
  };

  const endBattle = (won: boolean) => {
    if (won && currentEnemy) {
      markEnemyDefeated(currentEnemy.id);
    }
    setCurrentEnemy(null);
    setScene("overworld");
    if (!won) {
      // Respawn penalty
      setPlayerHp(100); 
      loseLife();
      setPlayerPos({ x: 10, y: 15, dir: "up" }); // Back to start
      showDialog("SHELL CRACKED. REFORMING...", "system");
    }
  };

  const showDialog = (text: string, speaker: "architect" | "system" | "none" = "system") => {
    setDialogInfo({ show: true, text, speaker });
  };

  const hideDialog = () => setDialogInfo(prev => ({ ...prev, show: false }));

  if (!isHydrated) return null;

  const decryptedClueCount = defeatedEnemies.length; // Simply bound to defeated boss count

  return (
    <GameContext.Provider value={{
      scene, playerPos, playerHp, playerMaxHp: 100, eggs, lives, timeRemaining, ultimateCharge, gameClues, decryptedClueCount, correctEggId, dialogInfo, currentEnemy,
      defeatedEnemies, checkedEggs, devBossPhase, setDevBossPhase,
      setScene, setPlayerPos, takeDamage, heal, loseLife, setLives, markEnemyDefeated, markEggChecked, collectEgg, addCharge, resetCharge, setTimeRemaining, setGameClues, setCorrectEggId, startBattle, endBattle, showDialog, hideDialog
    }}>
      {children}
    </GameContext.Provider>
  );
};
