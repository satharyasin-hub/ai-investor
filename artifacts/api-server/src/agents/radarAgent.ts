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
      alert: "3.2x average volume detected — institutional accumulation above ₹785 resistance",
      confidence: 78,
      type: "technical",
      price_change: 3.4,
    },
    {
      symbol: "ADANIENT.NS",
      name: "Adani Enterprises",
      signal: "Volume Surge",
      alert: "Abnormal buying pressure — 2.8x avg volume in last 3 NSE sessions",
      confidence: 71,
      type: "technical",
      price_change: 2.1,
    },
    {
      symbol: "INFY.NS",
      name: "Infosys",
      signal: "Momentum Gap",
      alert: "Price gap up on Q3 earnings beat — unfilled gap at ₹1,410 acting as support",
      confidence: 69,
      type: "technical",
      price_change: 1.8,
    },
    {
      symbol: "SBIN.NS",
      name: "State Bank of India",
      signal: "Double Bottom",
      alert: "Strong reversal forming at ₹800 — second test of support holds with volume",
      confidence: 74,
      type: "technical",
      price_change: 1.2,
    },
    {
      symbol: "BAJFINANCE.NS",
      name: "Bajaj Finance",
      signal: "Ascending Triangle",
      alert: "5 consecutive higher lows near ₹7,000 — compression before breakout",
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
      alert: "Director purchased 25,000 shares (₹40Cr) via NSE open market — high conviction",
      confidence: 85,
      type: "smart_money",
      price_change: 1.6,
    },
    {
      symbol: "TCS.NS",
      name: "Tata Consultancy Services",
      signal: "Bulk Deal",
      alert: "FII (Morgan Stanley) bought ₹320Cr block @ ₹3,650 — below prevailing market price",
      confidence: 79,
      type: "smart_money",
      price_change: 0.9,
    },
    {
      symbol: "RELIANCE.NS",
      name: "Reliance Industries",
      signal: "Promoter Buying",
      alert: "Promoter entity acquired 50,000 shares via open market — raises stake to 50.3%",
      confidence: 88,
      type: "smart_money",
      price_change: 2.3,
    },
    {
      symbol: "WIPRO.NS",
      name: "Wipro",
      signal: "Institutional Accumulation",
      alert: "Domestic MF (SBI Bluechip Fund) accumulated ₹180Cr across 3 consecutive sessions",
      confidence: 72,
      type: "smart_money",
      price_change: 1.1,
    },
    {
      symbol: "ICICIBANK.NS",
      name: "ICICI Bank",
      signal: "FII Inflow",
      alert: "Foreign Institutional Investors net bought ₹420Cr — 5-session consecutive inflow streak",
      confidence: 80,
      type: "smart_money",
      price_change: 1.4,
    },
  ];

  return { technical, smart_money };
}
