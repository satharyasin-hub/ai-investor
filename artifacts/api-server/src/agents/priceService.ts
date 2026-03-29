import YahooFinance from "yahoo-finance2";
import type { OHLCV } from "./dataService.js";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

function normalizeSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (upper === "NIFTY" || upper === "NIFTY50" || upper === "^NSEI") return "^NSEI";
  if (upper === "BANKNIFTY" || upper === "^NSEBANK") return "^NSEBANK";
  if (!upper.includes(".") && !upper.startsWith("^")) return upper + ".NS";
  return upper;
}

export async function getLivePrice(symbol: string): Promise<number | null> {
  const sym = normalizeSymbol(symbol);
  try {
    const quote = await yf.quote(sym);
    const price = (quote as any)?.regularMarketPrice ?? null;
    if (price && price > 0) {
      console.log(`[PriceService] Fetching price for ${sym}: ${price}`);
      return price;
    }
    return null;
  } catch {
    console.warn(`[PriceService] Live price unavailable for ${sym}, using simulation`);
    return null;
  }
}

export async function getLiveOHLCV(symbol: string, days = 90): Promise<OHLCV[] | null> {
  const sym = normalizeSymbol(symbol);
  try {
    const period2 = new Date();
    const period1 = new Date();
    period1.setDate(period1.getDate() - Math.ceil(days * 1.5));

    const result = await yf.chart(sym, { period1, period2, interval: "1d" });

    const quotes = (result as any)?.quotes;
    if (!quotes || quotes.length < 10) return null;

    const ohlcv: OHLCV[] = quotes
      .filter((q: any) => q.close != null && q.open != null)
      .slice(-days)
      .map((q: any) => ({
        date: new Date(q.date).toISOString().split("T")[0],
        open: parseFloat(Number(q.open).toFixed(2)),
        high: parseFloat(Number(q.high).toFixed(2)),
        low: parseFloat(Number(q.low).toFixed(2)),
        close: parseFloat(Number(q.close).toFixed(2)),
        volume: Math.round(q.volume ?? 0),
      }));

    if (ohlcv.length >= 10) {
      console.log(`[PriceService] Fetching price for ${sym}: ${ohlcv[ohlcv.length - 1]?.close}`);
      return ohlcv;
    }
    return null;
  } catch {
    console.warn(`[PriceService] Live OHLCV unavailable for ${sym}, using simulation`);
    return null;
  }
}

export async function getNiftyTrend(): Promise<{ price: number; changePercent: number; trend: string } | null> {
  try {
    const quote = await yf.quote("^NSEI") as any;
    const price = quote?.regularMarketPrice ?? 0;
    const changePercent = quote?.regularMarketChangePercent ?? 0;
    const trend = changePercent > 0.3 ? "Bullish" : changePercent < -0.3 ? "Bearish" : "Sideways";
    if (price > 0) {
      console.log(`[PriceService] Fetching price for ^NSEI: ${price}`);
      return { price, changePercent, trend };
    }
    return null;
  } catch {
    return null;
  }
}
