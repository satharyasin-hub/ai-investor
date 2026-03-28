export interface RadarItem {
  symbol: string;
  name: string;
  signal: string;
  alert: string;
  confidence: number;
  type: "technical" | "smart_money";
  price_change: number;
}

export interface RadarData {
  technical: RadarItem[];
  smart_money: RadarItem[];
}

export function getRadar(): RadarData {
  const technical: RadarItem[] = [
    {
      symbol: "TATAMOTORS.NS",
      name: "Tata Motors",
      signal: "Breakout",
      alert: "3.2x average volume detected — institutional accumulation likely",
      confidence: 78,
      type: "technical",
      price_change: 3.4,
    },
    {
      symbol: "ADANIENT.NS",
      name: "Adani Enterprises",
      signal: "Volume Surge",
      alert: "Abnormal buying pressure — 2.8x avg volume in last 3 sessions",
      confidence: 71,
      type: "technical",
      price_change: 2.1,
    },
    {
      symbol: "INFY.NS",
      name: "Infosys",
      signal: "Momentum Gap",
      alert: "Price gap up on earnings beat — unfilled gap at ₹1410",
      confidence: 69,
      type: "technical",
      price_change: 1.8,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      signal: "Double Bottom",
      alert: "Strong reversal pattern forming at 200-day MA support",
      confidence: 74,
      type: "technical",
      price_change: 1.2,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      signal: "Ascending Triangle",
      alert: "5 consecutive higher lows — compression before breakout",
      confidence: 82,
      type: "technical",
      price_change: 2.9,
    },
  ];

  const smart_money: RadarItem[] = [
    {
      symbol: "HDFCBANK.NS",
      name: "HDFC Bank",
      signal: "Insider Trade",
      alert: "Director purchased 25,000 shares (₹40Cr) via open market — high conviction",
      confidence: 85,
      type: "smart_money",
      price_change: 1.6,
    },
    {
      symbol: "TCS.NS",
      name: "Tata Consultancy Services",
      signal: "Bulk Deal",
      alert: "FII (Morgan Stanley) bought ₹320Cr block @ 3650 — below market price",
      confidence: 79,
      type: "smart_money",
      price_change: 0.9,
    },
    {
      symbol: "RELIANCE.NS",
      name: "Reliance Industries",
      signal: "Promoter Buying",
      alert: "Promoter entity acquired 50k shares — raises stake to 50.3%",
      confidence: 88,
      type: "smart_money",
      price_change: 2.3,
    },
    {
      symbol: "WIPRO.NS",
      name: "Wipro",
      signal: "Institutional Accumulation",
      alert: "Domestic MF (SBI Bluechip) bought ₹180Cr in 3 sessions",
      confidence: 72,
      type: "smart_money",
      price_change: 1.1,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      signal: "CEO Purchase",
      alert: "Executive VP bought $2.5M shares — first insider buy in 18 months",
      confidence: 80,
      type: "smart_money",
      price_change: 1.4,
    },
  ];

  return { technical, smart_money };
}
