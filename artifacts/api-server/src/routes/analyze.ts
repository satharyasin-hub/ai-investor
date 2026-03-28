import { Router, type IRouter } from "express";
import { AnalyzeStockBody, AnalyzeStockResponse, GetOpportunityRadarResponse } from "@workspace/api-zod";
import { getStockData } from "../agents/dataService.js";
import { detectPattern } from "../agents/patternAgent.js";
import { detectTrend } from "../agents/trendAgent.js";
import { calcRisk } from "../agents/riskAgent.js";
import { detectSmartMoney } from "../agents/smartMoneyAgent.js";
import { analyzeSentiment } from "../agents/sentimentAgent.js";
import { calcConfidence } from "../agents/confidenceAgent.js";
import { makeDecision } from "../agents/decisionAgent.js";
import { generateExplanation } from "../agents/explanationAgent.js";
import { calcRSI, calcVolumeAnalysis } from "../agents/indicators.js";
import { getRadar } from "../agents/radarAgent.js";

const router: IRouter = Router();

router.post("/analyze", async (req, res) => {
  try {
    const parseResult = AnalyzeStockBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid request", message: "symbol is required" });
      return;
    }

    const { symbol } = parseResult.data;

    const stockData = getStockData(symbol);
    const closes = stockData.ohlcv.map((d) => d.close);

    const rsiArr = calcRSI(closes);
    const rsi = rsiArr[rsiArr.length - 1] || 50;

    const volumeAnalysis = calcVolumeAnalysis(stockData.ohlcv);

    const trendResult = detectTrend(stockData.ohlcv);
    const patternResult = detectPattern(stockData.ohlcv);
    const smartMoney = detectSmartMoney(stockData.ohlcv, symbol);
    const sentiment = analyzeSentiment(symbol);

    const confidenceResult = calcConfidence(
      trendResult.trend,
      patternResult.pattern,
      rsi,
      volumeAnalysis,
      smartMoney,
      sentiment,
      trendResult.strength
    );

    const decision = makeDecision(
      trendResult.trend,
      patternResult.pattern,
      rsi,
      confidenceResult.score,
      sentiment,
      smartMoney
    );

    const riskResult = calcRisk(stockData.ohlcv, trendResult.trend);

    const { explanation, beginner_tip } = generateExplanation(
      decision.signal,
      trendResult.trend,
      patternResult.pattern,
      smartMoney,
      sentiment,
      rsi
    );

    const confluence_badges = [
      {
        label: `Chart ${patternResult.pattern}`,
        type: "technical" as const,
        active: trendResult.trend !== "Sideways",
      },
      {
        label: "Insider Buying",
        type: "fundamental" as const,
        active: smartMoney.hasInsiderActivity,
      },
      {
        label: `${volumeAnalysis.spikeMultiple}x Volume Spike`,
        type: "technical" as const,
        active: volumeAnalysis.isSpike,
      },
      {
        label: `${sentiment.sentiment} Sentiment`,
        type: "sentiment" as const,
        active: sentiment.sentiment === "Positive",
      },
      {
        label: "Institutional Flow",
        type: "fundamental" as const,
        active: smartMoney.hasBulkDeal,
      },
      {
        label: `RSI ${rsi.toFixed(0)}`,
        type: "risk" as const,
        active: rsi >= 40 && rsi <= 65,
      },
    ];

    const response = AnalyzeStockResponse.parse({
      stock: stockData.name,
      current_price: stockData.currentPrice,
      decision: {
        signal: decision.signal,
        confidence: confidenceResult.score,
        entry: riskResult.entry,
        stop_loss: riskResult.stop_loss,
        target: riskResult.target,
        risk_reward: riskResult.risk_reward,
      },
      technical_analysis: {
        trend: trendResult.trend,
        pattern: patternResult.pattern,
        success_rate: patternResult.success_rate,
        volume_alert: volumeAnalysis.isSpike
          ? `${volumeAnalysis.spikeMultiple}x Avg Volume Detected`
          : `Volume at ${volumeAnalysis.spikeMultiple}x average`,
        rsi: parseFloat(rsi.toFixed(1)),
        macd_signal: trendResult.macdSignal,
        ma20: trendResult.ma20,
        ma50: trendResult.ma50,
        price_change_pct: parseFloat(
          (((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100).toFixed(2)
        ),
      },
      fundamental_analysis: {
        smart_money_alert: smartMoney.insiderAlert,
        bulk_deal: smartMoney.bulkDealAlert,
        sentiment: `${sentiment.sentiment} — ${sentiment.headline}`,
        insider_confidence: smartMoney.insiderConfidence,
        institutional_flow: smartMoney.institutionalFlow,
      },
      explanation,
      beginner_tip,
      reasoning: decision.reasoning,
      confluence_badges,
      timestamp: new Date().toISOString(),
    });

    res.json(response);
  } catch (err) {
    req.log.error({ err }, "Error in /analyze");
    res.status(500).json({ error: "Analysis failed", message: "Internal server error" });
  }
});

router.get("/radar", (_req, res) => {
  try {
    const radarData = getRadar();
    const response = GetOpportunityRadarResponse.parse(radarData);
    res.json(response);
  } catch (err) {
    _req.log.error({ err }, "Error in /radar");
    res.status(500).json({ error: "Radar failed", message: "Internal server error" });
  }
});

export default router;
