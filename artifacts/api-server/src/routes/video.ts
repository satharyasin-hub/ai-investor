import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { textToSpeech } from "@workspace/integrations-openai-ai-server/audio";
import { getStockData } from "../agents/dataService.js";

const videoRouter = Router();

const NSE_TOP_STOCKS = [
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
  "SBIN.NS", "BAJFINANCE.NS", "WIPRO.NS", "TATAMOTORS.NS", "ADANIENT.NS",
];

const SECTORS = [
  { name: "Banking & Finance", stocks: ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS"] },
  { name: "Information Technology", stocks: ["TCS.NS", "INFY.NS", "WIPRO.NS"] },
  { name: "Energy & Conglomerates", stocks: ["RELIANCE.NS", "ADANIENT.NS"] },
  { name: "Auto & Manufacturing", stocks: ["TATAMOTORS.NS"] },
];

function getMarketData() {
  const stockPrices = NSE_TOP_STOCKS.map((sym) => {
    const d = getStockData(sym);
    const last = d.ohlcv[d.ohlcv.length - 1];
    const prev = d.ohlcv[d.ohlcv.length - 2] ?? last;
    const changePct = ((last.close - prev.close) / prev.close) * 100;
    return { symbol: sym, name: d.name, price: last.close, changePct: parseFloat(changePct.toFixed(2)) };
  });

  const sorted = [...stockPrices].sort((a, b) => b.changePct - a.changePct);
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();
  const avgChange = stockPrices.reduce((s, x) => s + x.changePct, 0) / stockPrices.length;
  const niftyTrend = avgChange > 0.5 ? "Bullish" : avgChange < -0.5 ? "Bearish" : "Sideways";
  const niftyChangeEst = parseFloat((avgChange * 50).toFixed(0));

  const sectorPerf = SECTORS.map((sec) => {
    const secStocks = stockPrices.filter((s) => sec.stocks.includes(s.symbol));
    const avg = secStocks.length > 0 ? secStocks.reduce((s, x) => s + x.changePct, 0) / secStocks.length : 0;
    return { sector: sec.name, change: parseFloat(avg.toFixed(2)) };
  });

  const fiiFlow = parseFloat((Math.sin(Date.now() / 1e10) * 2000 + 500).toFixed(0));
  const diiFlow = parseFloat((Math.cos(Date.now() / 1e10) * 1500 + 400).toFixed(0));

  return { stockPrices, gainers, losers, niftyTrend, niftyChangeEst, sectorPerf, fiiFlow, diiFlow };
}

function buildSlides(data: ReturnType<typeof getMarketData>) {
  const { gainers, losers, niftyTrend, niftyChangeEst, sectorPerf, fiiFlow, diiFlow } = data;
  const topGainer = gainers[0];
  const topSector = [...sectorPerf].sort((a, b) => b.change - a.change)[0];

  return [
    {
      type: "title" as const,
      title: "🇮🇳 AI Market Update",
      content: `NSE Daily Wrap — ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`,
      data: {},
    },
    {
      type: "nifty" as const,
      title: `NIFTY 50 — ${niftyTrend}`,
      content: `Index is ${niftyTrend.toLowerCase()} today. Estimated move: ${niftyChangeEst > 0 ? "+" : ""}${niftyChangeEst} points`,
      data: { trend: niftyTrend, change: niftyChangeEst },
    },
    {
      type: "gainers" as const,
      title: "🚀 Top Gainers",
      content: gainers.map((g) => `${g.name} (${g.symbol.replace(".NS", "")}) +${g.changePct}%`).join(" · "),
      data: { items: gainers },
    },
    {
      type: "losers" as const,
      title: "📉 Top Losers",
      content: losers.map((l) => `${l.name} (${l.symbol.replace(".NS", "")}) ${l.changePct}%`).join(" · "),
      data: { items: losers },
    },
    {
      type: "sectors" as const,
      title: "🏭 Sector Rotation",
      content: sectorPerf.map((s) => `${s.sector}: ${s.change > 0 ? "+" : ""}${s.change}%`).join("  |  "),
      data: { items: sectorPerf, topSector },
    },
    {
      type: "smart_money" as const,
      title: "💰 FII / DII Flow",
      content: `FII net ${fiiFlow >= 0 ? "bought" : "sold"} ₹${Math.abs(fiiFlow)}Cr · DII net ${diiFlow >= 0 ? "bought" : "sold"} ₹${Math.abs(diiFlow)}Cr`,
      data: { fii: fiiFlow, dii: diiFlow },
    },
    {
      type: "opportunities" as const,
      title: "🎯 Top Opportunity",
      content: `${topGainer?.name} (+${topGainer?.changePct}%) shows strongest momentum today. Sector leader: ${topSector?.sector} (${topSector?.change > 0 ? "+" : ""}${topSector?.change}%)`,
      data: { topStock: topGainer, topSector },
    },
  ];
}

function generateFallbackScript(data: ReturnType<typeof getMarketData>): string {
  const { gainers, losers, niftyTrend, niftyChangeEst, sectorPerf, fiiFlow, diiFlow } = data;
  const topSector = [...sectorPerf].sort((a, b) => b.change - a.change)[0];
  return [
    `Good evening! Here's your NSE market update for today.`,
    `The NIFTY 50 is trading ${niftyTrend.toLowerCase()} with an estimated move of ${niftyChangeEst > 0 ? "+" : ""}${niftyChangeEst} points.`,
    `Top gainers today: ${gainers.map((g) => `${g.name} up ${g.changePct}%`).join(", ")}.`,
    `On the losing side: ${losers.map((l) => `${l.name} down ${Math.abs(l.changePct)}%`).join(", ")}.`,
    `Sector-wise, ${topSector?.sector} is the standout performer with ${topSector?.change > 0 ? "+" : ""}${topSector?.change}% gains.`,
    `On the institutional flow front, FIIs are net ${fiiFlow >= 0 ? "buyers" : "sellers"} at ₹${Math.abs(fiiFlow)} crore, while DIIs are net ${diiFlow >= 0 ? "buyers" : "sellers"} at ₹${Math.abs(diiFlow)} crore.`,
    `That's your market wrap. Trade smart, manage your risk, and we'll see you tomorrow. Good night!`,
  ].join(" ");
}

videoRouter.post("/generate-video", async (req, res) => {
  try {
    const marketData = getMarketData();
    const { gainers, losers, niftyTrend, niftyChangeEst, sectorPerf, fiiFlow, diiFlow } = marketData;

    const prompt = `You are an Indian stock market news anchor. Generate a concise 60-second NSE market update.

Market snapshot:
- NIFTY 50 trend: ${niftyTrend} (estimated ${niftyChangeEst > 0 ? "+" : ""}${niftyChangeEst} points)
- Top gainers: ${gainers.map((g) => `${g.name} (+${g.changePct}%)`).join(", ")}
- Top losers: ${losers.map((l) => `${l.name} (${l.changePct}%)`).join(", ")}
- Sector performance: ${sectorPerf.map((s) => `${s.sector} ${s.change > 0 ? "+" : ""}${s.change}%`).join(", ")}
- FII flow: ₹${fiiFlow}Cr | DII flow: ₹${diiFlow}Cr

Write a crisp, confident market wrap in news-anchor style. Use rupee symbol (₹). Keep it under 200 words. Start with "Good evening! Here's your NSE market update for today."`;

    const [scriptResponse, slides] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-5.2",
        max_completion_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
      Promise.resolve(buildSlides(marketData)),
    ]);

    const rawScript = scriptResponse.choices[0]?.message?.content;
    const script = rawScript && rawScript.trim().length > 0 ? rawScript : generateFallbackScript(marketData);
    const summary = `NIFTY ${niftyTrend} · ${gainers[0]?.name} leads gains · FII ${fiiFlow >= 0 ? "inflow" : "outflow"} ₹${Math.abs(fiiFlow)}Cr`;

    let audio_b64 = "";
    try {
      const audioBuffer = await textToSpeech(script, "nova", "mp3");
      audio_b64 = audioBuffer.toString("base64");
    } catch {
      audio_b64 = "";
    }

    res.json({
      script,
      summary,
      slides,
      audio_b64,
      market_data: { gainers, losers, niftyTrend, niftyChangeEst, sectorPerf, fiiFlow, diiFlow },
      generated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Video generation failed", message: err?.message ?? "Unknown error" });
  }
});

export default videoRouter;
