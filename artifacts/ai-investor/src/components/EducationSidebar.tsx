import React, { useState, useEffect } from "react";
import { Lightbulb, Info, ChevronDown, ChevronRight, GraduationCap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TERMS = [
  {
    term: "Liquidity Sweep",
    tech: "Occurs when price temporarily breaches a significant swing high or low to trigger stop-loss orders before reversing direction. Institutions use this to fill large orders.",
    simple: "Big players push the price just enough to hit regular people's stop-loss orders. Once they collect those shares, they send the price the other way."
  },
  {
    term: "BOS (Break of Structure)",
    tech: "A continuation signal where price breaks past the previous swing high (in an uptrend) or swing low (in a downtrend), confirming the ongoing trend.",
    simple: "The stock successfully breaks through its previous 'ceiling' (if going up) or 'floor' (if going down), showing the trend is still strong."
  },
  {
    term: "CHoCH (Change of Character)",
    tech: "The first shift in market structure signaling a potential trend reversal. In a downtrend, it's breaking the last lower high. In an uptrend, breaking the last higher low.",
    simple: "The first major warning sign that a trend might be ending and reversing direction."
  },
  {
    term: "RSI Divergence",
    tech: "When price makes a higher high but the Relative Strength Index (RSI) makes a lower high (bearish), or price makes a lower low but RSI makes a higher low (bullish).",
    simple: "The stock price is going one way, but its underlying momentum (strength) is going the opposite way. Usually means a reversal is coming."
  }
];

export function EducationSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm glass-panel border-r-0 border-t-0 border-b-0 rounded-none z-50 overflow-y-auto flex flex-col shadow-2xl shadow-black/50"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-display font-semibold">Trader Academy</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="glass-card p-4 rounded-2xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BotIcon className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-sm">Beginner Mode</span>
                </div>
                <button
                  onClick={() => setBeginnerMode(!beginnerMode)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    beginnerMode ? "bg-purple-500" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                    animate={{ left: beginnerMode ? "28px" : "4px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {TERMS.map((item, idx) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div key={item.term} className="glass-card rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium font-display">{item.term}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={beginnerMode ? "simple" : "tech"}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {beginnerMode ? item.simple : item.tech}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary/80 leading-relaxed">
                    AI Investor uses Smart Money Concepts (SMC) to detect institutional order flow. Keep this sidebar open to learn the terminology as you analyze stocks.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
