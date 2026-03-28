import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Activity, ShieldAlert, LineChart, FileText, Bot, Zap, Network } from "lucide-react";

const agents = [
  { name: "Pattern Recognition Agent", icon: Network, color: "text-blue-400" },
  { name: "Trend Analysis Engine", icon: Activity, color: "text-cyan-400" },
  { name: "Risk Assessment Model", icon: ShieldAlert, color: "text-rose-400" },
  { name: "Smart Money Tracker", icon: Zap, color: "text-purple-400" },
  { name: "Sentiment Analyzer", icon: FileText, color: "text-amber-400" },
  { name: "Decision Synthesizer", icon: Brain, color: "text-emerald-400" }
];

export function AgentLoadingAnimation() {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgentIndex((prev) => (prev + 1) % agents.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl w-full max-w-md mx-auto">
      <div className="relative w-24 h-24 mb-8">
        {/* Pulsing background rings */}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-primary/50"
        />
        <motion.div 
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute inset-0 rounded-full border border-primary/30"
        />
        
        {/* Core brain icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-background rounded-full border border-white/10 z-10 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
          <Bot className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-display font-medium text-foreground mb-2">
        Synthesizing AI Models
      </h3>
      
      <div className="h-6 overflow-hidden w-full relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentAgentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2 absolute inset-0"
          >
            {React.createElement(agents[currentAgentIndex].icon, { 
              className: `w-4 h-4 ${agents[currentAgentIndex].color}` 
            })}
            <span className="text-sm font-medium text-muted-foreground">
              {agents[currentAgentIndex].name} processing...
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 7.2, ease: "linear" }}
        />
      </div>
    </div>
  );
}
