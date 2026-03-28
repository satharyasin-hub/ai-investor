import type { Trend } from "./trendAgent.js";
import type { Pattern } from "./patternAgent.js";
import type { Signal } from "./decisionAgent.js";
import type { SentimentResult } from "./sentimentAgent.js";
import type { SmartMoneySignal } from "./smartMoneyAgent.js";

const EXPLANATIONS: Record<Signal, (trend: Trend, pattern: Pattern, smart: SmartMoneySignal, sentiment: SentimentResult, rsi: number) => { explanation: string; beginner_tip: string }> = {
  "STRONG BUY": (trend, pattern, smart, sentiment, rsi) => ({
    explanation: `This is a high-conviction setup. The stock is in a clear ${trend} trend and the ${pattern} pattern gives us strong timing for entry. ${smart.hasInsiderActivity ? "Promoter/insider buying activity confirms confidence from within the company. " : ""}${smart.hasBulkDeal ? "Large institutions are accumulating shares. " : ""}Sentiment is ${sentiment.sentiment.toLowerCase()} with the latest news: "${sentiment.headline}". RSI at ${rsi.toFixed(0)} shows healthy momentum — not overbought. All agents agree: this is a STRONG BUY.`,
    beginner_tip: `Think of it this way: the chart says "go up," AND the company's own bosses are buying. When insiders buy with their own money, it's a strong signal they believe the stock will rise. The big banks are also buying in bulk — they don't do that unless they're very confident!`,
  }),
  "BUY": (trend, pattern, smart, sentiment, rsi) => ({
    explanation: `The ${trend} trend is supported by the ${pattern} pattern. Moving averages are aligned in favor of buyers, and RSI at ${rsi.toFixed(0)} shows momentum without being stretched. ${smart.hasBulkDeal || smart.hasInsiderActivity ? "Some institutional activity adds confirmation to the technical signal. " : ""}Overall, this is a favorable risk-reward setup with a stop loss below key support.`,
    beginner_tip: `The stock's chart shows buyers are in control. Think of it like a tug of war where the bulls (buyers) are winning. We have a clear entry point, and if the trade goes wrong, we have a defined exit (stop loss) to protect your money.`,
  }),
  "WAIT": (trend, pattern, smart, sentiment, rsi) => ({
    explanation: `The analysis shows mixed signals. While there are some ${trend === "Bullish" ? "positive" : "concerning"} technical signs with the ${pattern} pattern, the overall confluence is not strong enough to justify entering a position right now. RSI at ${rsi.toFixed(0)} ${rsi > 70 ? "indicates overbought conditions — entering here increases risk of a pullback" : "is neutral"}. ${sentiment.shouldInvalidate ? `News sentiment is negative: "${sentiment.headline}" — this could suppress the move.` : "Patience here could lead to a much better entry point."}`,
    beginner_tip: `"WAIT" doesn't mean the stock is bad — it means the timing isn't perfect yet. It's like waiting at a traffic light. Jumping early increases risk. Let the signals align and enter with confidence. Cash is also a position!`,
  }),
  "SELL": (trend, pattern, smart, sentiment, rsi) => ({
    explanation: `The ${trend} trend and ${pattern} pattern suggest downside pressure. ${sentiment.shouldInvalidate ? `The negative news — "${sentiment.headline}" — adds fundamental risk to the technical weakness. ` : ""}RSI at ${rsi.toFixed(0)} ${rsi > 65 ? "shows the bounce may be exhausted" : "confirms bearish momentum"}. Risk management suggests reducing exposure or hedging.`,
    beginner_tip: `The stock is showing weakness — like a ball rolling downhill. When big funds start selling and the chart breaks support, it's usually better to step aside. Protecting capital is more important than chasing every trade!`,
  }),
  "STRONG SELL": (trend, pattern, smart, sentiment, rsi) => ({
    explanation: `Multiple agents have aligned on a bearish outcome. The ${pattern} in a ${trend} trend context is a high-probability setup for further decline. ${sentiment.shouldInvalidate ? `Negative catalysts (" ${sentiment.headline}") compound the technical weakness. ` : ""}Volume analysis confirms distribution — institutions appear to be exiting. This warrants an immediate risk-off stance.`,
    beginner_tip: `This is a "get out fast" signal. When the chart, the news, and the big players are all saying "sell," it's wise to listen. Holding a falling stock hoping it bounces is one of the biggest mistakes retail traders make. Cut losses, stay safe.`,
  }),
};

export function generateExplanation(
  signal: Signal,
  trend: Trend,
  pattern: Pattern,
  smartMoney: SmartMoneySignal,
  sentiment: SentimentResult,
  rsi: number
): { explanation: string; beginner_tip: string } {
  const fn = EXPLANATIONS[signal];
  return fn(trend, pattern, smartMoney, sentiment, rsi);
}
