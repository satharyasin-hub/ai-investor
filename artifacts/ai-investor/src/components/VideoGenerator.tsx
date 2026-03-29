import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, Download, Clapperboard, TrendingUp, TrendingDown,
  Building2, DollarSign, Target, Radio, ChevronLeft, ChevronRight, Mic,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface VideoSlide {
  type: "title" | "nifty" | "gainers" | "losers" | "sectors" | "smart_money" | "opportunities";
  title: string;
  content: string;
  data: Record<string, any>;
}

interface VideoData {
  script: string;
  summary: string;
  slides: VideoSlide[];
  audio_b64: string;
  market_data: Record<string, any>;
  generated_at: string;
}

const SLIDE_DURATION = 7000;

const slideIcons: Record<VideoSlide["type"], React.ReactNode> = {
  title: <Clapperboard size={28} />,
  nifty: <TrendingUp size={28} />,
  gainers: <TrendingUp size={28} />,
  losers: <TrendingDown size={28} />,
  sectors: <Building2 size={28} />,
  smart_money: <DollarSign size={28} />,
  opportunities: <Target size={28} />,
};

const slideColors: Record<VideoSlide["type"], string> = {
  title: "from-blue-600/30 to-indigo-800/30 border-blue-500/40",
  nifty: "from-emerald-600/30 to-teal-800/30 border-emerald-500/40",
  gainers: "from-green-600/30 to-emerald-800/30 border-green-500/40",
  losers: "from-red-600/30 to-rose-800/30 border-red-500/40",
  sectors: "from-purple-600/30 to-violet-800/30 border-purple-500/40",
  smart_money: "from-amber-600/30 to-yellow-800/30 border-amber-500/40",
  opportunities: "from-cyan-600/30 to-blue-800/30 border-cyan-500/40",
};

function NiftySlide({ data }: { data: Record<string, any> }) {
  const isBull = data.trend === "Bullish";
  const isBear = data.trend === "Bearish";
  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      <div className={cn(
        "text-5xl font-bold font-mono",
        isBull ? "text-green-400" : isBear ? "text-red-400" : "text-yellow-400"
      )}>
        {data.change > 0 ? "+" : ""}{data.change} pts
      </div>
      <span className={cn(
        "px-4 py-1.5 rounded-full text-sm font-semibold",
        isBull ? "bg-green-500/20 text-green-300 border border-green-500/40" :
        isBear ? "bg-red-500/20 text-red-300 border border-red-500/40" :
        "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
      )}>
        {data.trend}
      </span>
    </div>
  );
}

function GainersLosersSlide({ items, isGainer }: { items: any[]; isGainer: boolean }) {
  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      {items.map((item: any) => (
        <div key={item.symbol} className="flex items-center justify-between glass-card px-3 py-2 rounded-xl">
          <div>
            <span className="text-sm font-semibold text-foreground">{item.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">{item.symbol.replace(".NS", "")}</span>
          </div>
          <span className={cn("font-mono font-bold text-sm", isGainer ? "text-green-400" : "text-red-400")}>
            {item.changePct > 0 ? "+" : ""}{item.changePct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function SectorsSlide({ items }: { items: any[] }) {
  const max = Math.max(...items.map((s: any) => Math.abs(s.change)), 1);
  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      {items.map((sec: any) => (
        <div key={sec.sector} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-32 shrink-0 truncate">{sec.sector}</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", sec.change >= 0 ? "bg-green-400" : "bg-red-400")}
              style={{ width: `${(Math.abs(sec.change) / max) * 100}%` }}
            />
          </div>
          <span className={cn("font-mono text-xs w-12 text-right", sec.change >= 0 ? "text-green-400" : "text-red-400")}>
            {sec.change > 0 ? "+" : ""}{sec.change}%
          </span>
        </div>
      ))}
    </div>
  );
}

function SmartMoneySlide({ data }: { data: Record<string, any> }) {
  return (
    <div className="flex gap-6 mt-4 justify-center w-full">
      {[
        { label: "FII", value: data.fii, color: data.fii >= 0 ? "text-green-400" : "text-red-400" },
        { label: "DII", value: data.dii, color: data.dii >= 0 ? "text-green-400" : "text-red-400" },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center glass-card rounded-2xl px-8 py-4">
          <span className="text-xs text-muted-foreground mb-1">{item.label} Net Flow</span>
          <span className={cn("text-2xl font-bold font-mono", item.color)}>
            {item.value >= 0 ? "+" : ""}₹{Math.abs(item.value)}Cr
          </span>
          <span className={cn("text-xs mt-1", item.color)}>
            {item.value >= 0 ? "Net Buyer" : "Net Seller"}
          </span>
        </div>
      ))}
    </div>
  );
}

function SlideContent({ slide }: { slide: VideoSlide }) {
  switch (slide.type) {
    case "nifty":
      return <NiftySlide data={slide.data} />;
    case "gainers":
      return <GainersLosersSlide items={slide.data.items ?? []} isGainer={true} />;
    case "losers":
      return <GainersLosersSlide items={slide.data.items ?? []} isGainer={false} />;
    case "sectors":
      return <SectorsSlide items={slide.data.items ?? []} />;
    case "smart_money":
      return <SmartMoneySlide data={slide.data} />;
    default:
      return null;
  }
}

export default function VideoGenerator() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showScript, setShowScript] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const stopPlayback = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [clearTimers]);

  const goToSlide = useCallback((idx: number) => {
    setCurrentSlide(idx);
    setProgress(0);
  }, []);

  const startSlideTimer = useCallback((startIdx: number, totalSlides: number) => {
    clearTimers();
    let elapsed = 0;
    const tick = 50;
    progressRef.current = setInterval(() => {
      elapsed += tick;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
      if (elapsed >= SLIDE_DURATION) {
        elapsed = 0;
        setCurrentSlide((prev) => {
          const next = prev + 1;
          if (next >= totalSlides) {
            clearTimers();
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
        setProgress(0);
      }
    }, tick);
  }, [clearTimers]);

  const play = useCallback(() => {
    if (!videoData) return;
    setIsPlaying(true);
    if (audioRef.current && videoData.audio_b64) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    startSlideTimer(currentSlide, videoData.slides.length);
  }, [videoData, currentSlide, startSlideTimer]);

  const pause = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setVideoData(null);
    stopPlayback();
    setCurrentSlide(0);
    try {
      const resp = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: "NSE" }),
      });
      if (!resp.ok) throw new Error("Generation failed");
      const data: VideoData = await resp.json();
      setVideoData(data);
      if (data.audio_b64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
        audioRef.current = audio;
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!videoData) return;
    const blob = new Blob([videoData.script], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nse-market-update-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const slide = videoData?.slides[currentSlide];

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30">
            <Clapperboard className="text-rose-400" size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">AI Market Video Engine</h3>
            <p className="text-xs text-muted-foreground">Auto-generated NSE market update</p>
          </div>
        </div>
        {videoData && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>

      {!videoData && !loading && (
        <div className="flex flex-col items-center gap-6 py-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
              <Clapperboard size={40} className="text-rose-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
              <Radio size={12} className="text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm max-w-xs">
              AI generates a full market update video with script, narration, and animated slides — all from live NSE data.
            </p>
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
              {error}
            </div>
          )}
          <Button
            onClick={generate}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold px-8 h-12 rounded-2xl shadow-lg shadow-rose-500/20"
          >
            <Clapperboard size={18} className="mr-2" />
            Generate Market Video
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 py-14">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/40 animate-ping" style={{ animationDelay: "0.3s" }} />
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <Clapperboard size={30} className="text-rose-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">AI is generating your market video...</p>
            <p className="text-xs text-muted-foreground mt-1">Fetching data · Writing script · Generating voice</p>
          </div>
          <div className="flex gap-1.5">
            {["Fetching NSE data", "Writing script", "Generating voice", "Building slides"].map((step, i) => (
              <motion.div
                key={step}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
              >
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {videoData && slide && (
        <div className="flex flex-col gap-5">
          <div className="text-xs text-muted-foreground text-right">
            Generated {new Date(videoData.generated_at).toLocaleTimeString("en-IN")}
          </div>

          {/* Video Player */}
          <div className={cn(
            "relative rounded-2xl border bg-gradient-to-br p-6 min-h-[260px] flex flex-col overflow-hidden",
            slideColors[slide.type]
          )}>
            <div className="absolute top-3 right-3 text-xs text-muted-foreground font-mono">
              {currentSlide + 1} / {videoData.slides.length}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col flex-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="opacity-80">{slideIcons[slide.type]}</div>
                  <h4 className="text-xl font-display font-bold">{slide.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{slide.content}</p>
                <SlideContent slide={slide} />
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-purple-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToSlide(Math.max(0, currentSlide - 1))}
              className="p-2 rounded-xl glass-card hover:bg-white/10 transition-colors"
              disabled={currentSlide === 0}
            >
              <ChevronLeft size={16} />
            </button>

            {isPlaying ? (
              <button onClick={pause} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 text-rose-300 transition-colors">
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button onClick={play} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-300 transition-colors">
                <Play size={16} /> Play
              </button>
            )}

            <button
              onClick={() => { stopPlayback(); goToSlide(0); }}
              className="p-2 rounded-xl glass-card hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => goToSlide(Math.min(videoData.slides.length - 1, currentSlide + 1))}
              className="p-2 rounded-xl glass-card hover:bg-white/10 transition-colors"
              disabled={currentSlide === videoData.slides.length - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Slide dots */}
          <div className="flex justify-center gap-1.5">
            {videoData.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentSlide ? "bg-rose-400 w-6" : "bg-white/20 w-1.5 hover:bg-white/40"
                )}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="glass-card rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
            <Radio size={14} className="text-rose-400 shrink-0" />
            <span>{videoData.summary}</span>
          </div>

          {/* Audio indicator */}
          {videoData.audio_b64 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mic size={12} className="text-green-400" />
              <span>AI voice narration available — click Play to hear the market update</span>
            </div>
          )}

          {/* Script & Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowScript((v) => !v)}
              className="flex-1 h-9 rounded-xl glass-card border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              {showScript ? "Hide Script" : "View Script"}
            </button>
            <button
              onClick={downloadScript}
              className="h-9 px-4 rounded-xl glass-card border border-white/10 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Download size={12} /> Download
            </button>
            <button
              onClick={() => { setVideoData(null); setCurrentSlide(0); }}
              className="h-9 px-4 rounded-xl glass-card border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              Regenerate
            </button>
          </div>

          <AnimatePresence>
            {showScript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-xl p-4 text-sm leading-relaxed text-muted-foreground font-mono border border-white/10">
                  {videoData.script}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
