import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  score: number; // 0 to 100
  signal: string;
}

export function ConfidenceMeter({ score, signal }: ConfidenceMeterProps) {
  // Determine colors based on signal type, not just score, for proper context
  const isBuy = signal.includes("BUY");
  const isSell = signal.includes("SELL");
  
  let colorClass = "bg-warning";
  let gradientClass = "from-amber-500 to-yellow-400";
  let textClass = "text-amber-400";
  let bgGlow = "shadow-amber-500/20";

  if (isBuy) {
    colorClass = "bg-success";
    gradientClass = "from-emerald-500 to-green-400";
    textClass = "text-emerald-400";
    bgGlow = "shadow-emerald-500/20";
  } else if (isSell) {
    colorClass = "bg-destructive";
    gradientClass = "from-rose-500 to-red-400";
    textClass = "text-rose-400";
    bgGlow = "shadow-rose-500/20";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background track */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-white/5"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 88}
            initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={cn(textClass, "drop-shadow-[0_0_8px_rgba(currentColor,0.5)]")}
          />
        </svg>
        
        <div className="flex flex-col items-center text-center z-10">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className={cn("text-3xl font-display font-bold tracking-tight", textClass)}
          >
            {score}%
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            Confidence
          </span>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={cn(
          "mt-6 px-6 py-2 rounded-full border shadow-lg font-display font-bold tracking-widest uppercase text-sm",
          isBuy ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10" : 
          isSell ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10" : 
          "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10"
        )}
      >
        {signal}
      </motion.div>
    </div>
  );
}
