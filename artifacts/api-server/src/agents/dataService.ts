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

const STOCK_PROFILES: Record<string, { name: string; basePrice: number; sector: string }> = {
  "RELIANCE.NS": { name: "Reliance Industries", basePrice: 2450, sector: "Energy" },
  "TCS.NS": { name: "Tata Consultancy Services", basePrice: 3680, sector: "IT" },
  "HDFCBANK.NS": { name: "HDFC Bank", basePrice: 1620, sector: "Banking" },
  "INFY.NS": { name: "Infosys", basePrice: 1480, sector: "IT" },
  "TATAMOTORS.NS": { name: "Tata Motors", basePrice: 785, sector: "Auto" },
  "ADANIENT.NS": { name: "Adani Enterprises", basePrice: 2340, sector: "Conglomerate" },
  "ICICIBANK.NS": { name: "ICICI Bank", basePrice: 1120, sector: "Banking" },
  "WIPRO.NS": { name: "Wipro", basePrice: 465, sector: "IT" },
  "AAPL": { name: "Apple Inc.", basePrice: 178, sector: "Technology" },
  "MSFT": { name: "Microsoft Corp.", basePrice: 415, sector: "Technology" },
  "GOOGL": { name: "Alphabet Inc.", basePrice: 175, sector: "Technology" },
  "TSLA": { name: "Tesla Inc.", basePrice: 250, sector: "EV" },
  "NVDA": { name: "NVIDIA Corp.", basePrice: 875, sector: "Semiconductors" },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateOHLCV(basePrice: number, days: number, symbolSeed: number): OHLCV[] {
  const data: OHLCV[] = [];
  let price = basePrice * (0.85 + seededRandom(symbolSeed) * 0.15);
  const baseVolume = 1000000 + seededRandom(symbolSeed + 1) * 5000000;

  const trend = seededRandom(symbolSeed + 99) > 0.5 ? 1 : -1;

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

export function getStockData(symbol: string): StockData {
  const upperSymbol = symbol.toUpperCase();
  const profile = STOCK_PROFILES[upperSymbol] || {
    name: upperSymbol,
    basePrice: 100 + (upperSymbol.charCodeAt(0) * 23) % 900,
    sector: "Unknown",
  };

  const symbolSeed = upperSymbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ohlcv = generateOHLCV(profile.basePrice, 120, symbolSeed);
  const currentPrice = ohlcv[ohlcv.length - 1].close;

  return {
    symbol: upperSymbol,
    name: profile.name,
    currentPrice,
    ohlcv,
  };
}
