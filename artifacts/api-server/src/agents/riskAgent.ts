import type { OHLCV } from "./dataService.js";
import type { Trend } from "./trendAgent.js";

export interface RiskResult {
  entry: number;
  stop_loss: number;
  target: number;
  risk_reward: string;
}

export function calcRisk(ohlcv: OHLCV[], trend: Trend): RiskResult {
  const closes = ohlcv.map((d) => d.close);
  const highs = ohlcv.map((d) => d.high);
  const lows = ohlcv.map((d) => d.low);

  const currentPrice = closes[closes.length - 1];

  const recentHigh = Math.max(...highs.slice(-15));
  const recentLow = Math.min(...lows.slice(-15));
  const atr = (recentHigh - recentLow) * 0.5;

  let entry: number;
  let stop_loss: number;
  let target: number;

  if (trend === "Bullish") {
    entry = currentPrice;
    stop_loss = currentPrice - atr * 1.2;
    target = currentPrice + atr * 2.5;
  } else if (trend === "Bearish") {
    entry = currentPrice;
    stop_loss = currentPrice + atr * 1.2;
    target = currentPrice - atr * 2.5;
  } else {
    entry = currentPrice;
    stop_loss = currentPrice - atr * 0.8;
    target = currentPrice + atr * 1.8;
  }

  const risk = Math.abs(entry - stop_loss);
  const reward = Math.abs(target - entry);
  const rrRatio = reward / risk;

  return {
    entry: parseFloat(entry.toFixed(2)),
    stop_loss: parseFloat(stop_loss.toFixed(2)),
    target: parseFloat(target.toFixed(2)),
    risk_reward: `1:${rrRatio.toFixed(1)}`,
  };
}
