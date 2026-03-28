import type { OHLCV } from "./dataService.js";
import { calcSMA, calcEMA } from "./indicators.js";

export type Trend = "Bullish" | "Bearish" | "Sideways";

export interface TrendResult {
  trend: Trend;
  ma20: number;
  ma50: number;
  macdSignal: string;
  strength: number;
}

export function detectTrend(ohlcv: OHLCV[]): TrendResult {
  const closes = ohlcv.map((d) => d.close);
  const ma20Arr = calcSMA(closes, 20);
  const ma50Arr = calcSMA(closes, 50);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);

  const currentPrice = closes[closes.length - 1];
  const ma20 = ma20Arr[ma20Arr.length - 1];
  const ma50 = ma50Arr[ma50Arr.length - 1];
  const ema12Current = ema12[ema12.length - 1];
  const ema26Current = ema26[ema26.length - 1];

  const ma20Prev = ma20Arr[ma20Arr.length - 5];
  const ma50Prev = ma50Arr[ma50Arr.length - 5];

  const ma20Rising = ma20 > ma20Prev;
  const ma50Rising = ma50 > ma50Prev;

  const priceAboveMA20 = currentPrice > ma20;
  const priceAboveMA50 = currentPrice > ma50;
  const ma20AboveMA50 = ma20 > ma50;

  const macdPositive = ema12Current > ema26Current;
  const macdSignal = macdPositive ? "Bullish crossover" : "Bearish crossover";

  let bullishSignals = 0;
  let bearishSignals = 0;

  if (priceAboveMA20) bullishSignals++;
  else bearishSignals++;
  if (priceAboveMA50) bullishSignals++;
  else bearishSignals++;
  if (ma20AboveMA50) bullishSignals++;
  else bearishSignals++;
  if (ma20Rising) bullishSignals++;
  else bearishSignals++;
  if (macdPositive) bullishSignals++;
  else bearishSignals++;

  let trend: Trend;
  let strength: number;

  if (bullishSignals >= 4) {
    trend = "Bullish";
    strength = 60 + bullishSignals * 8;
  } else if (bearishSignals >= 4) {
    trend = "Bearish";
    strength = 60 + bearishSignals * 8;
  } else {
    trend = "Sideways";
    strength = 40 + Math.min(bullishSignals, bearishSignals) * 5;
  }

  return {
    trend,
    ma20: parseFloat(ma20.toFixed(2)),
    ma50: parseFloat(ma50.toFixed(2)),
    macdSignal,
    strength: Math.min(strength, 100),
  };
}
