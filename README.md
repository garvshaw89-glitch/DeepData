# DEEPDATA — AI-Powered Capital Market Intelligence Platform

![DEEPDATA Platform](https://img.shields.io/badge/Platform-DEEPDATA-06b6d4?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-white?style=for-the-badge&logo=express&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285f4?style=for-the-badge&logo=google&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=for-the-badge&logo=vite&logoColor=white)

**DEEPDATA** is an institutional-grade financial intelligence workstation and terminal interface designed for equity analysts, retail investors, and quantitative traders. It bridges Indian capital markets (NSE & BSE) and worldwide global exchanges (NASDAQ, NYSE, LSE) into a cohesive, high-density analytics suite powered by Google Gemini AI.

---

## 🌟 Key Features

### 1. 📈 Real-Time Market Dashboard
- **Cross-Exchange Coverage**: Live tracking across Indian equities (Reliance, TCS, HDFC Bank, Infosys, Tata Motors, NIFTY 50) and Global equities & indices (Apple, Microsoft, Nvidia, S&P 500, Nasdaq 100).
- **Interactive Multi-Timeframe Charting**: Recharts-powered intraday and historical price charts across `1D`, `5D`, `1M`, `6M`, `1Y`, and `ALL`.
- **Order Book & Intraday Depth**: Real-time Level 2 style bid/ask volume distribution and trade execution log.
- **Dynamic Multi-Currency Support**: Automatic regional currency symbol switching (`₹` for Indian assets, `$` for global assets).
- **52-Week Range & Volume Diagnostics**: Key momentum markers and valuation indicators.

### 2. 🧠 Institutional AI Equity Research
- **Gemini-Powered Research Reports**: On-demand equity deep dives generated server-side using the `@google/genai` SDK.
- **12-Month Predictive Price Targets**: Calculated base, bull, and bear cases with automated upside/downside percentage modeling.
- **Scenario Analysis**: Post-earnings price forecast reconciliation (Beat vs. Miss projections).
- **Technical & Fundamental Diagnostics**: 50-day moving averages, RSI (14), MACD signals, support & resistance levels, P/E ratios, and dividend yields.
- **AI Investment Thesis & Risk Catalysts**: Synthesized growth vectors, key operational risks, and institutional consensus breakdown.

### 3. 🤖 AI Market Copilot
- **Persistent Conversational Terminal**: Built-in drawer to query macro market trends, compare competitors, analyze financial statements, and dissect portfolio risk.
- **Pre-Engineered Financial Prompts**: One-click shortcuts for portfolio risk audits, earnings surprise analysis, sector rotation forecasts, and valuation sanity checks.
- **Model Grounding & Fallbacks**: Fully operational with live Gemini 2.5 Flash API calls and structured offline fallback intelligence when running without an API key.

### 4. 📰 Real-Time News Feed & Sentiment Engine
- **Curated Multi-Outlet Aggregation**: Streams headlines from premier financial publishers:
  - **Indian Outlets**: *Moneycontrol*, *The Economic Times*, *LiveMint*, *Financial Express*
  - **Global Outlets**: *Bloomberg*, *Reuters*
- **FinBERT Sentiment Classification**: Automated article sentiment labeling (`BULLISH`, `BEARISH`, `NEUTRAL`) with confidence scores.
- **Ticker-Linked Metadata**: Direct cross-referencing to impacted tickers for rapid event-driven research.

### 5. 🔍 Quantitative Stock Screener
- **Multi-Metric Screening**: Filter across market capitalization, P/E ratios, dividend yield, performance change, sector, and region.
- **Instant Sorting**: Multi-column sorting by price, daily change, volume, and valuation metrics.

### 6. 💼 Portfolio & Risk Management
- **Holistic Net Worth Tracking**: Portfolio valuation combining cash reserves and equity holdings across regions.
- **Asset Allocation Breakdown**: Real-time visual pie charts detailing portfolio concentration by asset class and sector.
- **Performance Attribution**: Unrealized P&L calculations with individual position metrics and buy/sell transaction simulations.

### 7. 🔔 Real-Time Price & Technical Alerts
- **Custom Triggers**: Monitor price targets, percentage swings, and sentiment thresholds.
- **Status Management**: Active, triggered, and archived alerts with clear visual status flags.

### 8. 🔐 Authentication & Session Security
- **Complete Auth Lifecycle**: User registration with region preferences, email/password login, demo account one-click fill, and password recovery simulation.
- **Session Profile Manager**: Inspect active Bearer tokens, token expiration, user role authorizations, and preferences.

### 9. 🗄️ Core Data Model & Schema Inspector
- **Interactive ERD Explorer**: View architectural relationships between Authentication, Market Feeds, and Portfolio domains.
- **Field-Level Attribute Dictionary**: Inspect data types, nullability, primary keys (`PK`), foreign keys (`FK`), and database indexing strategies.
- **Raw JSON Schemas**: Direct preview and export of REST API payloads.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with custom high-density dark terminal theme |
| **Visualizations** | [Recharts](https://recharts.org/) |
| **Icons & UI** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Backend Server** | [Express.js](https://expressjs.com/) via `tsx` (dev) & `esbuild` CJS bundle (production) |
| **AI Engine** | [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) |

---

## 📂 Project Structure

```text
├── server.ts                    # Express server with Vite middleware, Auth & Gemini API routes
├── index.html                   # HTML entry point with metadata synchronization
├── metadata.json                # AI Studio application metadata & capability declarations
├── package.json                 # Dependencies and build/start scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4 plugin
├── .env.example                 # Documented environment variables template
└── src/
    ├── main.tsx                 # React application mounting point
    ├── App.tsx                  # Root layout, navigation router, and quote management
    ├── index.css                # Global CSS with Tailwind v4 setup
    ├── types.ts                 # TypeScript type definitions and domain interfaces
    ├── data/
    │   └── mockMarketData.ts    # Comprehensive institutional seed data & asset quotes
    └── components/
        ├── Navbar.tsx           # Ticker tape, quick search, auth status & navigation tabs
        ├── MarketDashboard.tsx  # Candlestick/line charts, order book, sector heatmaps
        ├── StockAnalysisView.tsx# AI research reports, valuation models & technicals
        ├── AICopilotDrawer.tsx  # Slide-over Gemini AI financial copilot chat
        ├── ScreenerView.tsx     # Quantitative stock screener with metric filters
        ├── PortfolioView.tsx    # Asset allocation, portfolio holdings & performance
        ├── NewsFeedView.tsx     # Indian & Global news feed with FinBERT sentiment
        ├── AlertsView.tsx       # Price & sentiment trigger manager
        ├── AuthModal.tsx        # Authentication, registration & session inspector modal
        └── DataModelView.tsx    # Interactive database schema dictionary & ERD explorer
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `bun`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/deepdata.git
cd deepdata
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Google Gemini API key:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

> **Note:** DEEPDATA features intelligent fallback simulation if no `GEMINI_API_KEY` is provided, allowing full evaluation in offline/sandbox environments.

### 4. Run Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm start
```

This builds the frontend static bundle via Vite and compiles `server.ts` into a self-contained CommonJS bundle at `dist/server.cjs` via `esbuild`.

### 6. Lint & Validate Types

```bash
npm run lint
```

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck endpoint returning server status |
| `GET` | `/api/market/quotes` | Retrieve market quotes filtered by query or symbol |
| `GET` | `/api/news` | Get curated market news with sentiment analysis |
| `POST` | `/api/ai/analyze` | Request institutional AI research report for an asset |
| `POST` | `/api/ai/chat` | Send conversational prompt to Gemini Market Copilot |
| `POST` | `/api/auth/register` | Register a new user profile with regional focus |
| `POST` | `/api/auth/login` | Authenticate user credentials and return `AuthSession` |
| `GET` | `/api/auth/session` | Validate Bearer token and retrieve active session |
| `POST` | `/api/auth/recover-password` | Request password reset verification token |
| `POST` | `/api/auth/reset-password` | Finalize password reset with valid token |
| `GET` | `/api/data-model` | Return database entity schemas and ERD topology |

---

## ⚖️ Financial Disclaimer

DEEPDATA is designed for educational, informational, and analytical research purposes only. Nothing within this software constitutes personalized investment advice, a solicitation, or an endorsement to buy or sell securities, commodities, or financial instruments. Always consult a qualified financial advisor before executing capital market trades.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
