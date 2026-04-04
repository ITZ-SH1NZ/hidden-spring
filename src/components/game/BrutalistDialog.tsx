"use client";

import { useGame } from "../../app/game/GameContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BrutalistDialog() {
  const { dialogInfo, hideDialog } = useGame();

  return (
    <AnimatePresence>
      {dialogInfo.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[150] flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm"
          onClick={hideDialog}
        >
          <div className="max-w-4xl px-8 w-full cursor-pointer">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
            >
               {dialogInfo.speaker === "architect" && (
                 <div className="font-mono text-easter-hotpink font-bold tracking-widest text-sm mb-4 uppercase">
                   [ The Grey King ]
                 </div>
               )}
               <h2 
                 className={`font-black uppercase leading-[0.9] tracking-tighter ${dialogInfo.speaker === 'architect' ? 'text-white' : 'text-white'} text-[clamp(2.5rem,6vw,6rem)]`}
                 style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}
               >
                 "{dialogInfo.text}"
               </h2>
               
               <div className="mt-12 text-white/50 font-mono text-sm uppercase animate-pulse">
                 [ Click anywhere to continue ]
               </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
