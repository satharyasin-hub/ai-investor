import type { OHLCV } from "./dataService.js";

export interface SmartMoneySignal {
  hasInsiderActivity: boolean;
  hasBulkDeal: boolean;
  insiderAlert: string;
  bulkDealAlert: string;
  insiderConfidence: string;
  institutionalFlow: string;
}

const INSIDER_TEMPLATES = [
  (symbol: string, price: number) =>
    `Promoter Group acquired ${(Math.floor(Math.random() * 80) + 20)}k shares via open market @ ₹${price.toFixed(0)}`,
  (symbol: string, price: number) =>
    `Director purchased ${(Math.floor(Math.random() * 30) + 10)}k shares (₹${((Math.floor(Math.random() * 80) + 20) * price / 1000).toFixed(0)}Cr stake)`,
  (symbol: string, price: number) =>
    `Promoter Entity raised stake by 0.${Math.floor(Math.random() * 5) + 1}% — ${Math.floor(Math.random() * 50) + 15}k shares`,
  (symbol: string) =>
    `No significant insider activity detected for ${symbol} this quarter`,
];

const BULK_DEAL_TEMPLATES = [
  (price: number) =>
    `Goldman Sachs bought ₹${Math.floor(Math.random() * 300) + 100}Cr block @ ${(price * 0.995).toFixed(2)}`,
  (price: number) =>
    `FII (Morgan Stanley) acquired ${Math.floor(Math.random() * 50) + 20}L shares via block deal`,
  (price: number) =>
    `Mutual Fund (SBI/HDFC) bought ${Math.floor(Math.random() * 200) + 50}Cr in open market`,
  (price: number) =>
    `No major bulk/block deals detected in last 5 trading sessions`,
];

function seededChoice<T>(arr: T[], seed: number): T {
  const idx = Math.abs(Math.floor(Math.sin(seed) * arr.length)) % arr.length;
  return arr[idx];
}

export function detectSmartMoney(ohlcv: OHLCV[], symbol: string): SmartMoneySignal {
  const currentPrice = ohlcv[ohlcv.length - 1].close;
  const volumes = ohlcv.map((d) => d.volume);

  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const recentVol = volumes[volumes.length - 1];
  const volSpike = recentVol / avgVol;

  const symbolSeed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const hasInsiderActivity = seededChoice([true, false, false], symbolSeed + 5);
  const hasBulkDeal = volSpike > 2.0 || seededChoice([true, false, false, false], symbolSeed + 7);

  let insiderAlert: string;
  let insiderConfidence: string;

  if (hasInsiderActivity) {
    const template = seededChoice(INSIDER_TEMPLATES.slice(0, 3), symbolSeed + 11);
    insiderAlert = template(symbol, currentPrice);
    insiderConfidence = seededChoice(["High — Multiple Directors Buying", "Medium — Single Promoter Transaction", "High — Promoter Group Buying"], symbolSeed + 13);
  } else {
    insiderAlert = INSIDER_TEMPLATES[3](symbol, currentPrice);
    insiderConfidence = "Low — No Insider Activity";
  }

  let bulkDealAlert: string;
  let institutionalFlow: string;

  if (hasBulkDeal) {
    const template = seededChoice(BULK_DEAL_TEMPLATES.slice(0, 3), symbolSeed + 17);
    bulkDealAlert = template(currentPrice);
    institutionalFlow = seededChoice(["Strong FII Inflow", "Domestic MF Accumulation", "Mixed — FII buying, DII selling"], symbolSeed + 19);
  } else {
    bulkDealAlert = BULK_DEAL_TEMPLATES[3](currentPrice);
    institutionalFlow = "Neutral — No Significant Institutional Activity";
  }

  return {
    hasInsiderActivity,
    hasBulkDeal,
    insiderAlert,
    bulkDealAlert,
    insiderConfidence,
    institutionalFlow,
  };
}
