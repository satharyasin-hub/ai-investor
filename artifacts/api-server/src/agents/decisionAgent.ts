import type { Trend } from "./trendAgent.js";
import type { Pattern } from "./patternAgent.js";
import type { SentimentResult } from "./sentimentAgent.js";
import type { SmartMoneySignal } from "./smartMoneyAgent.js";

export type Signal = "STRONG BUY" | "BUY" | "WAIT" | "SELL" | "STRONG SELL";

export interface DecisionResult {
  signal: Signal;
  reasoning: string;
}

export function makeDecision(
  trend: Trend,
  pattern: Pattern,
  rsi: number,
  confidence: number,
  sentiment: SentimentResult,
  smartMoney: SmartMoneySignal
): DecisionResult {
  const bullishPatterns: Pattern[] = ["Breakout", "Ascending Triangle", "Double Bottom", "Bullish Flag", "Momentum Expansion"];
  const bearishPatterns: Pattern[] = ["Breakdown", "Descending Triangle", "Double Top", "Bearish Flag"];

  const isBullishPattern = bullishPatterns.includes(pattern);
  const isBearishPattern = bearishPatterns.includes(pattern);
  const isOverbought = rsi > 75;
  const isOversold = rsi < 30;

  const smartMoneyBullish = smartMoney.hasInsiderActivity || smartMoney.hasBulkDeal;
  const sentimentBad = sentiment.shouldInvalidate;

  let signal: Signal;
  const reasons: string[] = [];

  if (trend === "Bullish" && isBullishPattern && smartMoneyBullish && !sentimentBad && confidence >= 75) {
    signal = "STRONG BUY";
    reasons.push(`${trend} trend confirmed`, `${pattern} pattern detected`, "Smart money accumulating", `Sentiment: ${sentiment.sentiment}`);
  } else if (trend === "Bullish" && isBullishPattern && !sentimentBad && confidence >= 60) {
    signal = "BUY";
    reasons.push(`${trend} trend with ${pattern}`, "MA crossover confirming uptrend", `RSI at ${rsi.toFixed(0)} — healthy`);
  } else if (trend === "Bearish" && isBearishPattern && confidence >= 75) {
    signal = "STRONG SELL";
    reasons.push(`${trend} trend with ${pattern}`, "Bears in control", `Sentiment: ${sentiment.sentiment}`);
  } else if (trend === "Bearish" && isBearishPattern && confidence >= 55) {
    signal = "SELL";
    reasons.push(`${trend} trend`, `${pattern} confirms weakness`);
  } else if (sentimentBad && trend !== "Bullish") {
    signal = "SELL";
    reasons.push(`Negative news: "${sentiment.headline}"`, "Risk elevated — avoid new positions");
  } else if (isOverbought && !smartMoneyBullish) {
    signal = "WAIT";
    reasons.push(`RSI overbought at ${rsi.toFixed(0)}`, "Wait for pullback before entry");
  } else if (trend === "Sideways" || confidence < 55) {
    signal = "WAIT";
    reasons.push("No clear directional bias", `Low confluence — confidence only ${confidence}%`);
  } else {
    signal = "WAIT";
    reasons.push("Mixed signals across agents", "Patience is a position");
  }

  return {
    signal,
    reasoning: reasons.join(" | "),
  };
}
