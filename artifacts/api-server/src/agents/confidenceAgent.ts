import type { Trend } from "./trendAgent.js";
import type { Pattern } from "./patternAgent.js";
import type { SmartMoneySignal } from "./smartMoneyAgent.js";
import type { SentimentResult } from "./sentimentAgent.js";
import type { VolumeAnalysis } from "./indicators.js";

export interface ConfidenceResult {
  score: number;
  breakdown: Record<string, number>;
}

export function calcConfidence(
  trend: Trend,
  pattern: Pattern,
  rsi: number,
  volumeAnalysis: VolumeAnalysis,
  smartMoney: SmartMoneySignal,
  sentiment: SentimentResult,
  trendStrength: number
): ConfidenceResult {
  const breakdown: Record<string, number> = {};

  breakdown.trend = trend === "Sideways" ? 10 : Math.round(trendStrength * 0.3);

  const highConfPatterns: Pattern[] = ["Breakout", "Ascending Triangle", "Double Bottom", "Momentum Expansion"];
  const medConfPatterns: Pattern[] = ["Bullish Flag", "Reversal Setup", "FVG (Fair Value Gap)"];
  if (highConfPatterns.includes(pattern)) breakdown.pattern = 25;
  else if (medConfPatterns.includes(pattern)) breakdown.pattern = 15;
  else breakdown.pattern = 8;

  if (rsi >= 40 && rsi <= 60) breakdown.rsi = 10;
  else if (rsi > 60 && rsi < 70) breakdown.rsi = 12;
  else if (rsi >= 30 && rsi < 40) breakdown.rsi = 8;
  else breakdown.rsi = 4;

  if (volumeAnalysis.isSpike) breakdown.volume = 15;
  else if (volumeAnalysis.volumeRatio > 1.3) breakdown.volume = 10;
  else breakdown.volume = 5;

  if (smartMoney.hasInsiderActivity && smartMoney.hasBulkDeal) breakdown.smartMoney = 20;
  else if (smartMoney.hasInsiderActivity || smartMoney.hasBulkDeal) breakdown.smartMoney = 12;
  else breakdown.smartMoney = 3;

  if (sentiment.sentiment === "Positive") breakdown.sentiment = 10;
  else if (sentiment.sentiment === "Neutral") breakdown.sentiment = 5;
  else breakdown.sentiment = -10;

  let total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  total = Math.max(0, Math.min(98, total));

  if (sentiment.shouldInvalidate && total > 50) {
    total = Math.round(total * 0.7);
  }

  return { score: Math.round(total), breakdown };
}
