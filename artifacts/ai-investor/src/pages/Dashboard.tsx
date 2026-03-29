import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeStock } from "@workspace/api-client-react";
import type { AnalysisResult } from "@workspace/api-client-react";
import { Brain, Activity, LineChart, Target, Shield, BookOpen, ChevronRight, AlertTriangle, Play } from "lucide-react";
import { StockSearch } from "@/components/StockSearch";
import { AgentLoadingAnimation } from "@/components/AgentLoadingAnimation";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { EducationSidebar } from "@/components/EducationSidebar";
import { OpportunityRadar } from "@/components/OpportunityRadar";
import VideoGenerator from "@/components/VideoGenerator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeStock({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        // Scroll slightly down to results
        window.scrollTo({ top: 200, behavior: 'smooth' });
      },
      onError: (error) => {
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze stock. Please try another symbol.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSearch = (symbol: string) => {
    analyzeMutation.mutate({ data: { symbol } });
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-primary/30">
      {/* Background Image managed in global CSS, but we can add a hero overlay */}
      <div 
        className="absolute inset-0 z-[-1] opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/terminal-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <header className="w-full py-6 px-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">
            AI <span className="text-primary">Investor</span>
          </h1>
        </div>
        <Button 
          variant="glass" 
          size="sm" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="gap-2 rounded-full"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Trader Academy</span>
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        {/* Hero Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide">
              🇮🇳 India Mode — NSE Smart Money Signals
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
            Indian Market <span className="text-gradient-primary">AI Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Multi-agent AI analyzes NSE price action, promoter activity, bulk deals, and institutional flow to generate institutional-grade trading signals.
          </p>
          
          <StockSearch onSearch={handleSearch} isLoading={analyzeMutation.isPending} />
        </motion.div>

        {/* Results / Loading Area */}
        <AnimatePresence mode="wait">
          {analyzeMutation.isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12"
            >
              <AgentLoadingAnimation />
            </motion.div>
          )}

          {!analyzeMutation.isPending && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Decorative background glow based on signal */}
                <div className={cn(
                  "absolute -top-24 -left-24 w-96 h-96 bg-opacity-20 blur-3xl rounded-full pointer-events-none",
                  result.decision.signal.includes("BUY") ? "bg-emerald-500" : 
                  result.decision.signal.includes("SELL") ? "bg-rose-500" : "bg-amber-500"
                )} />

                <div className="flex-1 z-10 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-4xl font-mono font-bold">{result.stock}</h2>
                    <Badge variant="glass" className="text-sm px-3 py-1">
                      {formatCurrency(result.current_price)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">Generated {new Date(result.timestamp).toLocaleTimeString()}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    {result.confluence_badges.map((badge, i) => (
                      <Badge 
                        key={i} 
                        variant={badge.active ? "success" : "glass"}
                        className={cn("px-3 py-1.5 flex items-center gap-1.5", !badge.active && "opacity-50 grayscale")}
                      >
                        {badge.type === 'technical' && <LineChart className="w-3 h-3" />}
                        {badge.type === 'fundamental' && <Activity className="w-3 h-3" />}
                        {badge.type === 'risk' && <Shield className="w-3 h-3" />}
                        {badge.type === 'sentiment' && <Brain className="w-3 h-3" />}
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 z-10 bg-black/20 p-6 rounded-3xl border border-white/5">
                  <ConfidenceMeter score={result.decision.confidence} signal={result.decision.signal} />
                </div>

                {/* Trade Setup Details */}
                <div className="flex-1 z-10 w-full md:w-auto glass-card p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Trade Setup
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Zone</p>
                      <p className="font-mono font-medium text-lg">{formatCurrency(result.decision.entry)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target Price</p>
                      <p className="font-mono font-medium text-lg text-emerald-400">{formatCurrency(result.decision.target)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stop Loss</p>
                      <p className="font-mono font-medium text-lg text-rose-400">{formatCurrency(result.decision.stop_loss)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk : Reward</p>
                      <p className="font-mono font-medium text-lg text-blue-400">{result.decision.risk_reward}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Two Column Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical */}
                <div className="glass-panel p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <LineChart className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-semibold text-xl">Technical Analysis</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <AnalysisRow label="Trend" value={result.technical_analysis.trend} highlight={result.technical_analysis.trend === 'Bullish' ? 'success' : result.technical_analysis.trend === 'Bearish' ? 'danger' : 'neutral'} />
                    <AnalysisRow label="Pattern Detected" value={result.technical_analysis.pattern} />
                    <AnalysisRow label="Pattern Success Rate" value={result.technical_analysis.success_rate} />
                    <AnalysisRow label="RSI (14)" value={formatNumber(result.technical_analysis.rsi)} />
                    <AnalysisRow label="MACD Signal" value={result.technical_analysis.macd_signal} />
                    <AnalysisRow label="Volume Profile" value={result.technical_analysis.volume_alert} />
                  </div>
                </div>

                {/* Fundamental / Smart Money */}
                <div className="glass-panel p-6 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-semibold text-xl">Smart Money Data</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <AnalysisRow label="Institutional Flow" value={result.fundamental_analysis.institutional_flow} />
                    <AnalysisRow label="Smart Money Alert" value={result.fundamental_analysis.smart_money_alert} highlight="purple" />
                    <AnalysisRow label="Recent Bulk Deals" value={result.fundamental_analysis.bulk_deal} />
                    <AnalysisRow label="Insider Confidence" value={result.fundamental_analysis.insider_confidence} />
                    <AnalysisRow label="Market Sentiment" value={result.fundamental_analysis.sentiment} />
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="glass-panel p-6 lg:p-8 rounded-3xl bg-gradient-to-b from-slate-900/50 to-slate-900/80">
                <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" /> AI Synthesis
                </h3>
                <p className="text-lg leading-relaxed text-white/90 mb-6">
                  {result.explanation}
                </p>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-amber-500 font-semibold mb-1">Beginner Translation</h5>
                    <p className="text-amber-200/80 text-sm leading-relaxed">{result.beginner_tip}</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <OpportunityRadar onSelectStock={handleSearch} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <VideoGenerator />
        </motion.div>
      </main>

      <EducationSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}

function AnalysisRow({ label, value, highlight = "neutral" }: { label: string, value: string | number, highlight?: "success" | "danger" | "neutral" | "purple" }) {
  const getHighlightColor = () => {
    switch (highlight) {
      case "success": return "text-emerald-400 font-medium";
      case "danger": return "text-rose-400 font-medium";
      case "purple": return "text-purple-400 font-medium";
      default: return "text-white/90";
    }
  };

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn("text-right text-sm", getHighlightColor())}>{value}</span>
    </div>
  );
}
