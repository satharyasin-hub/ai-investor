import { getLiveOHLCV } from "./priceService.js";

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  currentPrice: number;
  ohlcv: OHLCV[];
  name: string;
}

export const STOCK_PROFILES: Record<string, { name: string; basePrice: number; sector: string }> = {
  "RELIANCE.NS": { name: "Reliance Industries", basePrice: 1280, sector: "Energy & Retail" },
  "TCS.NS": { name: "Tata Consultancy Services", basePrice: 3400, sector: "IT Services" },
  "HDFCBANK.NS": { name: "HDFC Bank", basePrice: 1700, sector: "Banking" },
  "INFY.NS": { name: "Infosys", basePrice: 1540, sector: "IT Services" },
  "TATAMOTORS.NS": { name: "Tata Motors", basePrice: 960, sector: "Auto" },
  "ADANIENT.NS": { name: "Adani Enterprises", basePrice: 2450, sector: "Conglomerate" },
  "ICICIBANK.NS": { name: "ICICI Bank", basePrice: 1340, sector: "Banking" },
  "WIPRO.NS": { name: "Wipro", basePrice: 480, sector: "IT Services" },
  "SBIN.NS": { name: "State Bank of India", basePrice: 810, sector: "PSU Banking" },
  "BAJFINANCE.NS": { name: "Bajaj Finance", basePrice: 7200, sector: "NBFC" },
  "BAJAJFINSV.NS": { name: "Bajaj Finserv", basePrice: 1690, sector: "Financial Services" },
  "HINDUNILVR.NS": { name: "Hindustan Unilever", basePrice: 2280, sector: "FMCG" },
  "AXISBANK.NS": { name: "Axis Bank", basePrice: 1100, sector: "Banking" },
  "KOTAKBANK.NS": { name: "Kotak Mahindra Bank", basePrice: 1790, sector: "Banking" },
  "MARUTI.NS": { name: "Maruti Suzuki", basePrice: 11500, sector: "Auto" },
  "SUNPHARMA.NS": { name: "Sun Pharma", basePrice: 1740, sector: "Pharma" },
  "ASIANPAINT.NS": { name: "Asian Paints", basePrice: 2340, sector: "Consumer" },
  "LT.NS": { name: "Larsen & Toubro", basePrice: 3450, sector: "Infrastructure" },
  "NTPC.NS": { name: "NTPC Limited", basePrice: 350, sector: "Power" },
  "POWERGRID.NS": { name: "Power Grid Corp", basePrice: 295, sector: "Power" },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSimulatedOHLCV(basePrice: number, days: number, symbolSeed: number): OHLCV[] {
  const data: OHLCV[] = [];
  const baseVolume = 1000000 + seededRandom(symbolSeed + 1) * 5000000;
  const trend = seededRandom(symbolSeed + 99) > 0.5 ? 1 : -1;

  // Anchor the starting price so simulation ends near basePrice
  const totalDrift = trend * 0.003 * days;
  let price = basePrice / Math.exp(totalDrift);

  for (let i = days; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);
    const dateStr = dateObj.toISOString().split("T")[0];

    const seed = symbolSeed + i * 7;
    const dayMove = (seededRandom(seed) - 0.45) * 0.025 + trend * 0.003;
    const volatility = 0.008 + seededRandom(seed + 1) * 0.012;

    const open = price;
    const closeMove = dayMove + (seededRandom(seed + 2) - 0.5) * volatility;
    const close = open * (1 + closeMove);
    const high = Math.max(open, close) * (1 + seededRandom(seed + 3) * volatility);
    const low = Math.min(open, close) * (1 - seededRandom(seed + 4) * volatility);

    let volume = baseVolume * (0.6 + seededRandom(seed + 5) * 0.8);
    if (i < 5 && seededRandom(seed + 6) > 0.6) {
      volume = volume * (2.5 + seededRandom(seed + 7) * 2);
    }

    data.push({
      date: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.round(volume),
    });

    price = close;
  }

  return data;
}

export async function getStockData(symbol: string): Promise<StockData> {
  const upperSymbol = symbol.toUpperCase();
  const profile = STOCK_PROFILES[upperSymbol] || {
    name: upperSymbol.replace(".NS", ""),
    basePrice: 500 + (upperSymbol.charCodeAt(0) * 23) % 2000,
    sector: "Unknown",
  };

  // Try live Yahoo Finance data first
  const liveOHLCV = await getLiveOHLCV(upperSymbol, 120);
  if (liveOHLCV && liveOHLCV.length >= 20) {
    const currentPrice = liveOHLCV[liveOHLCV.length - 1].close;
    return { symbol: upperSymbol, name: profile.name, currentPrice, ohlcv: liveOHLCV };
  }

  // Fallback: simulation anchored to realistic basePrice
  const symbolSeed = upperSymbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ohlcv = generateSimulatedOHLCV(profile.basePrice, 120, symbolSeed);
  const currentPrice = ohlcv[ohlcv.length - 1].close;

  return { symbol: upperSymbol, name: profile.name, currentPrice, ohlcv };
}

// Sync version for backward compat (uses simulation only, anchored to correct basePrice)
export function getStockDataSync(symbol: string): StockData {
  const upperSymbol = symbol.toUpperCase();
  const profile = STOCK_PROFILES[upperSymbol] || {
    name: upperSymbol.replace(".NS", ""),
    basePrice: 500 + (upperSymbol.charCodeAt(0) * 23) % 2000,
    sector: "Unknown",
  };
  const symbolSeed = upperSymbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ohlcv = generateSimulatedOHLCV(profile.basePrice, 120, symbolSeed);
  return { symbol: upperSymbol, name: profile.name, currentPrice: ohlcv[ohlcv.length - 1].close, ohlcv };
}
