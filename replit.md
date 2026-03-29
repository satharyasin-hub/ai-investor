# AI Investor — Hybrid Multi-Agent Trading Decision Engine

## Overview

A production-ready stock analysis web application powered by a 9-agent AI system. Simulates NSE/insider data with realistic volume spikes, price anomalies, and mock smart money signals when real data is unavailable.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Architecture

### 9-Agent AI System

1. **Pattern Agent** — Detects chart patterns: Breakout, Breakdown, Double Bottom/Top, Ascending/Descending Triangle, Bullish/Bearish Flag, FVG
2. **Trend Agent** — Determines Bullish/Bearish/Sideways using MA20/MA50 slopes and MACD
3. **Risk Agent** — Calculates Entry, Stop Loss, Target with dynamic ATR-based sizing (R:R ≥ 1:2)
4. **Backtest Agent** (via Pattern Agent) — Historical success rates per pattern
5. **Confidence Agent** — Bayesian scoring combining all signals (0–100)
6. **Explanation Agent** — Plain English explanations with beginner translations
7. **Opportunity Agent** — Dual scanning: Technical (volume/price) + Smart Money (insider/bulk deals)
8. **Sentiment Agent** — News headline analysis; invalidates BUY signals on negative news
9. **Decision Agent** — Supervisor; weights smart money higher; outputs STRONG BUY/BUY/WAIT/SELL/STRONG SELL

### Simulation Layer

Since real NSE API data is unavailable, the system simulates:
- **Volume spikes**: Seeded RNG generates realistic volume patterns with 2–5x spikes in recent sessions
- **Price anomalies**: ATR-based volatility with trend bias; flash crash/gap detection
- **Smart money signals**: Probabilistic insider trade alerts, bulk deal notifications
- **Sentiment**: Positive/Negative/Neutral news rotation per symbol seed

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ai-investor/       # React + Vite frontend
│   │   └── src/
│   │       ├── components/   # StockSearch, ConfidenceMeter, OpportunityRadar, EducationSidebar
│   │       └── pages/        # Dashboard.tsx (main page)
│   └── api-server/        # Express API server
│       └── src/
│           ├── agents/    # All 9 AI agents
│           └── routes/    # analyze.ts, health.ts, video.ts
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen config
│   ├── api-client-react/  # Generated React Query hooks
│   └── api-zod/           # Generated Zod schemas from OpenAPI
```

## API Endpoints

- `POST /api/analyze` — Full 9-agent analysis. Input: `{ symbol: "RELIANCE.NS" }`. Returns signal, confidence, entry/SL/target, technical + fundamental analysis, explanation.
- `GET /api/radar` — Opportunity radar with technical and smart money signals.
- `POST /api/generate-video` — AI Market Video Engine. Input: `{ market: "NSE" }`. Returns AI-generated script (gpt-5.2), TTS audio as base64 (gpt-audio/nova voice), 7 animated slides (title/nifty/gainers/losers/sectors/smart_money/opportunities), FII/DII flows, summary.

## UI Features

- Dark navy glassmorphism theme (#0f172a background)
- Animated confidence meter (red 0–60, yellow 60–80, green 80–100)
- Confluence badges per analysis type
- Right collapsible Education Sidebar (Liquidity Sweep, BOS, CHoCH with Beginner toggle)
- Opportunity Radar widget with Price Action / Smart Money tabs
- **AI Market Video Engine** — "Generate Market Video" button triggers backend LLM pipeline: script (gpt-5.2) + audio narration (gpt-audio nova TTS) + 7 auto-advancing animated slides with progress bar, prev/next controls, dot navigation, script viewer, download
- Framer Motion animations throughout
- Mobile responsive

## Packages

### Backend (api-server)
- `express`, `cors`, `pino`, `pino-http` — server
- `@workspace/api-zod` — request/response validation
- `@workspace/integrations-openai-ai-server` — Replit OpenAI integration (gpt-5.2 for scripts, gpt-audio for TTS)
- AI env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY` (auto-provisioned via Replit)

### Frontend (ai-investor)
- `react`, `react-dom`, `@tanstack/react-query`, `wouter`
- `framer-motion`, `lucide-react`, `@radix-ui/react-accordion`
- `@workspace/api-client-react` — generated hooks
- `tailwindcss`, `tw-animate-css`

## Dev Commands

- `pnpm --filter @workspace/ai-investor run dev` — frontend dev server
- `pnpm --filter @workspace/api-server run dev` — backend dev server
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client after spec change
