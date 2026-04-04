"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-mono text-white p-8">

      {/* Background ambient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,105,180,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Giant 404 */}
        <div className="text-[clamp(6rem,20vw,14rem)] font-black leading-none text-easter-hotpink drop-shadow-[0_0_40px_#FF69B4] tracking-tighter select-none">
          404
        </div>

        {/* Bouncing egg */}
        <motion.div
          className="my-6"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-20 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[linear-gradient(135deg,#FF69B4,#FFD700)] border-4 border-white/20 shadow-[0_0_30px_#FF69B4]" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4 text-white">
          EGG NOT FOUND
        </h1>

        <p className="text-white/50 tracking-widest text-sm mb-10 leading-relaxed">
          The Grey King stole this page.
        </p>

        {/* Decorative border box */}
        <div className="w-full border border-white/10 p-6 mb-10 text-white/30 text-xs tracking-[0.2em] leading-loose">
          ERROR_CODE: 404 // PAGE_NOT_IN_WARREN<br />
          STATUS: GREY_ZONE_DETECTED<br />
          RECOMMENDATION: RETREAT_TO_GARDEN
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-4 border-2 border-easter-hotpink text-easter-hotpink font-black tracking-widest uppercase hover:bg-easter-hotpink hover:text-black transition-colors"
          >
            RETURN TO THE GARDEN
          </button>
          <button
            onClick={() => router.push("/game")}
            className="flex-1 py-4 border-2 border-white text-white font-black tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
          >
            START HUNTING
          </button>
        </div>
      </motion.div>
    </div>
  );
}
