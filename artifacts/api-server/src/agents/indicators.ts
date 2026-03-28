import type { OHLCV } from "./dataService.js";

export function calcSMA(closes: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return result;
}

export function calcEMA(closes: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  let ema = closes[0];
  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      ema = closes[0];
    } else {
      ema = closes[i] * k + ema * (1 - k);
    }
    result.push(parseFloat(ema.toFixed(4)));
  }
  return result;
}

export function calcRSI(closes: number[], period: number = 14): number[] {
  const result: number[] = [];
  const changes: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }

  avgGain /= period;
  avgLoss /= period;

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    const idx = i - 1;
    if (idx >= period) {
      const change = changes[idx];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
  }

  return result;
}

export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calcMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const ema12 = calcEMA(closes, fastPeriod);
  const ema26 = calcEMA(closes, slowPeriod);

  const macd = ema12.map((v, i) => parseFloat((v - ema26[i]).toFixed(4)));
  const signal = calcEMA(macd, signalPeriod);
  const histogram = macd.map((v, i) => parseFloat((v - signal[i]).toFixed(4)));

  return { macd, signal, histogram };
}

export interface VolumeAnalysis {
  avgVolume: number;
  recentVolume: number;
  volumeRatio: number;
  isSpike: boolean;
  spikeMultiple: number;
}

export function calcVolumeAnalysis(ohlcv: OHLCV[]): VolumeAnalysis {
  const volumes = ohlcv.map((d) => d.volume);
  const avgPeriod = 20;
  const recentPeriod = 3;

  const avgVolume =
    volumes.slice(-avgPeriod - recentPeriod, -recentPeriod).reduce((a, b) => a + b, 0) /
    avgPeriod;

  const recentVolume =
    volumes.slice(-recentPeriod).reduce((a, b) => a + b, 0) / recentPeriod;

  const volumeRatio = recentVolume / avgVolume;
  const isSpike = volumeRatio > 1.8;
  const spikeMultiple = parseFloat(volumeRatio.toFixed(1));

  return { avgVolume, recentVolume, volumeRatio, isSpike, spikeMultiple };
}
