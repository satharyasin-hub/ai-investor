export type SentimentScore = "Positive" | "Negative" | "Neutral";

export interface SentimentResult {
  sentiment: SentimentScore;
  headline: string;
  managementTone: string;
  shouldInvalidate: boolean;
}

const POSITIVE_HEADLINES = [
  "Strong quarterly earnings beat estimates by 12%",
  "Management raises FY guidance citing robust demand",
  "Board approves ₹500Cr buyback at premium to market price",
  "New product line drives record revenue in Q3",
  "Debt reduction plan ahead of schedule — balance sheet strengthens",
  "Strategic partnership with global leader announced",
  "Promoter group expresses confidence, raises stake",
];

const NEGATIVE_HEADLINES = [
  "Tax authorities conduct survey at headquarters",
  "Margin pressure from rising input costs cited in Q3 call",
  "Key management departure raises succession concerns",
  "Regulatory probe announced — clarity awaited",
  "Revenue miss leads to analyst downgrades",
];

const NEUTRAL_HEADLINES = [
  "Company in-line with sector performance this quarter",
  "No material development reported this week",
  "Analyst community divided on near-term outlook",
  "Steady state operations, awaiting next earnings catalyst",
];

function seededChoice<T>(arr: T[], seed: number): T {
  const idx = Math.abs(Math.floor(Math.sin(seed) * 1000)) % arr.length;
  return arr[idx];
}

export function analyzeSentiment(symbol: string): SentimentResult {
  const symbolSeed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const r = Math.abs(Math.sin(symbolSeed * 17)) ;

  let sentiment: SentimentScore;
  let headline: string;
  let managementTone: string;
  let shouldInvalidate: boolean;

  if (r > 0.35) {
    sentiment = "Positive";
    headline = seededChoice(POSITIVE_HEADLINES, symbolSeed + 3);
    managementTone = "Confident — Upbeat Earnings Commentary";
    shouldInvalidate = false;
  } else if (r > 0.15) {
    sentiment = "Neutral";
    headline = seededChoice(NEUTRAL_HEADLINES, symbolSeed + 5);
    managementTone = "Cautious — No Strong Directional Commentary";
    shouldInvalidate = false;
  } else {
    sentiment = "Negative";
    headline = seededChoice(NEGATIVE_HEADLINES, symbolSeed + 7);
    managementTone = "Guarded — Acknowledged Headwinds";
    shouldInvalidate = true;
  }

  return { sentiment, headline, managementTone, shouldInvalidate };
}
