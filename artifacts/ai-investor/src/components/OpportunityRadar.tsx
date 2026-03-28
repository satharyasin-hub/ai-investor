import React, { useState } from "react";
import { useGetOpportunityRadar } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Badge } from "./ui/badge";
import { formatNumber } from "@/lib/utils";

export function OpportunityRadar({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
  const { data: radarData, isLoading, isError } = useGetOpportunityRadar();
  const [activeTab, setActiveTab] = useState<"technical" | "smart_money">("technical");

  if (isLoading) return null; // Or a subtle skeleton loader at the bottom
  if (isError || !radarData) return null;

  const items = radarData[activeTab];

  return (
    <div className="w-full mt-16 glass-panel rounded-3xl overflow-hidden border-t border-white/10">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <h3 className="font-display font-semibold text-lg">Opportunity Radar</h3>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "technical" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Price Action</span>
          </button>
          <button
            onClick={() => setActiveTab("smart_money")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "smart_money" ? "bg-purple-500/20 text-purple-300 shadow-sm" : "text-muted-foreground hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Smart Money</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={`${item.symbol}-${activeTab}`}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectStock(item.symbol)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg font-mono">{item.symbol}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{item.name}</p>
                  </div>
                  <Badge variant={item.signal.includes("BUY") ? "success" : item.signal.includes("SELL") ? "destructive" : "warning"}>
                    {item.signal}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium mb-4 line-clamp-2 text-white/80 h-10">
                  {item.alert}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {item.price_change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={`text-sm font-mono ${item.price_change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.price_change > 0 ? "+" : ""}{formatNumber(item.price_change)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>Analyze</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
