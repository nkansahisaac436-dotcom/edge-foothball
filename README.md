# ⚽ Matchday Edge

> **Mobile-First Football Prediction Web App (PWA)**  
> Real-time data, Dixon-Coles Poisson scoreline matrix, Negative Binomial corner & card distributions, and percentage predictions for every major Sporty Bet-style market.

---

## 🌟 Key Features

- **Mathematical Prediction Engine**:
  - **Dixon-Coles Goals Model**: Team attack and defence ratings from recent matches with exponential time decay ($w_k = 0.92^k$), home pitch advantage, and league goal benchmarks.
  - **11x11 Scoreline Matrix**: Full joint probabilities for scores 0–0 through 10–10 with Dixon-Coles low-score adjustment ($\tau(0,0), \tau(1,0), \tau(0,1), \tau(1,1)$ for $\rho = -0.11$) normalized exactly to $\sum P = 1.0$.
  - **Negative Binomial Corners**: Models overdispersion in corners (variance > mean), blending corners won and conceded with strength gap adjustments.
  - **Negative Binomial Cards**: Projects yellow and red card distributions using team averages, league rivalry factors, and referee statistics.
  - **Odds De-overrounding & Blending**: Strips bookmaker margin and blends market consensus with model projections (default 70% model, 30% market, configurable).
- **Major Sporty Bet-Style Markets**:
  - **Match Result**: 1X2, Double Chance (1X, X2, 12), Draw No Bet (DNB).
  - **Goals**: Over/Under 0.5, 1.5, 2.5, 3.5, 4.5, 5.5, Odd/Even total goals, Exact total goals.
  - **Both Teams to Score**: BTTS Yes/No, BTTS + Over/Under 2.5 combinations, Team Clean Sheet, Win to Nil.
  - **Team Goals**: Home & Away team totals Over/Under 0.5, 1.5, 2.5.
  - **Handicap**: European (-2, -1, +1, +2) and Asian (-0.5, -1, +0.5, +1).
  - **Halves**: 1st Half 1X2, 1st & 2nd Half Over/Under, Highest Scoring Half, HT/FT (9 outcomes).
  - **Scores**: Top 5 most probable exact scorelines.
  - **Corners**: Over/Under 6.5 through 13.5 (**Over 7.5 highlighted**), Team corners, 1st half corners, Corner handicap, Most corners.
  - **Cards**: Over/Under 2.5, 3.5, 4.5, 5.5, Home and Away team cards.
- **Fair Odds & Confidence Badges**:
  - Every probability displays percentage and fair odds ($100 / \text{percentage}$).
  - Confidence rating (High / Medium / Low) based on historical sample size and data quality.
  - Corners and cards marked as "Estimate".
- **Plain-English Match Analysis**:
  - Form records (last 5 W/D/L)
  - Attack vs defence comparison
  - Expected goals (xG Home vs Away), expected corners, and expected cards
  - Most likely scoreline chip
  - Data-driven narrative summary and key statistical insights
- **Curated Betting Panels**:
  - **Strongest Picks**: Filtered high-probability selections ranked from highest to lowest.
  - **Value Picks**: Positive mathematical edge bets where model probability exceeds bookmaker implied probability.
- **Custom Match Simulator**:
  - Enter any two teams with custom 1X2 odds or attack/defence strengths to simulate all betting markets instantly.
- **Accumulator Builder**:
  - Tap picks to add to the floating accumulator slip.
  - Displays combined probability and combined fair odds.
  - Prominent risk warning regarding exponential multi-bet variance.
- **Mobile-First PWA**:
  - Installable on iOS and Android with Web App Manifest and Service Worker.
  - Dark and Light mode toggle.
  - Timezone selector (defaults to Africa/Accra GMT, toggleable to local timezone).
  - Fast, low-bandwidth footprint (<250 kB client bundle).

---

## 🏗️ Architecture & Stack

```
Edge/
├── client/                     # Frontend (React 18 + Vite + TypeScript + Tailwind CSS)
│   ├── public/                 # PWA manifest, service worker (sw.js), icons
│   └── src/
│       ├── components/         # MatchCard, MarketGroupDrawer, Analysis, Accumulator, Modals
│       ├── context/            # AccumulatorContext
│       ├── services/           # API client
│       └── types/              # Unified TypeScript definitions
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # League configurations (config-driven leagues)
│   │   ├── controllers/        # Fixtures, predictions, custom match controllers
│   │   ├── engine/             # Dixon-Coles Poisson, Negative Binomial, Markets derivation
│   │   ├── routes/             # REST API routes (/api/fixtures, /api/match/:id/predictions)
│   │   ├── scripts/            # 200-match backtest engine and calibration analysis
│   │   └── services/           # Multi-provider football data layer & disk/memory cache
│   └── tests/                  # Vitest unit test suite
├── .env.example                # Sample environment configuration
└── package.json                # Root orchestration scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **npm**: v9+

### 2. Installation
Clone the repository and install dependencies:
```bash
# Clone the repository
git clone https://github.com/your-username/matchday-edge.git
cd matchday-edge

# Install server and client dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

> **Note on Free Offline Development**:  
> By default, `FOOTBALL_DATA_PROVIDER=auto` and empty API keys will automatically initialize the built-in **MockFootballDataProvider**. This provides rich, realistic match data across all 6 leagues, live odds, and full match statistics without requiring any API keys or network connection!

### 4. Running the Development Servers
Run the backend and frontend concurrently:
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Vite Frontend PWA (runs on http://localhost:3000)
npm run dev:client
```
Open **`http://localhost:3000`** in your browser or mobile device.

---

## 🔑 Football Data API Keys (Free Tier)

Matchday Edge uses a pluggable provider interface (`IFootballDataProvider`) that supports multiple data sources.

### Option A: API-Football (Recommended for full statistics)
1. Register for a free account at [api-sports.io](https://dashboard.api-football.com/).
2. Copy your API Key from the dashboard (Free tier provides 100 requests/day).
3. Update `server/.env`:
   ```env
   FOOTBALL_DATA_PROVIDER=api-football
   API_FOOTBALL_KEY=your_actual_api_key_here
   ```

### Option B: Football-Data.org
1. Register for a free account at [football-data.org](https://www.football-data.org/client/register).
2. Copy your API token from the confirmation email.
3. Update `server/.env`:
   ```env
   FOOTBALL_DATA_PROVIDER=football-data-org
   FOOTBALL_DATA_ORG_KEY=your_token_here
   ```

### Intelligent Caching
To prevent exhausting free tier rate limits, the server implements TTL caching:
- **Upcoming Fixtures**: Cached for 1 hour (`TTL_FIXTURES = 3600000 ms`).
- **Team Match Statistics**: Cached for 24 hours (`TTL_TEAM_STATS = 86400000 ms`).
- **Standings**: Cached for 6 hours.
Every response includes a `lastUpdated` timestamp displayed in the UI.

---

## ➕ How to Add a New League (Config-Only)

Adding a league requires zero code changes to the prediction engine or frontend. Simply append the new league definition to `server/src/config/leagues.ts`:

```typescript
{
  id: 'EED',                           // Unique league identifier
  name: 'Eredivisie',                  // Display name
  country: 'Netherlands',
  logo: 'https://media.api-sports.io/football/leagues/88.png',
  apiFootballId: 88,                   // API-Football league ID
  footballDataOrgCode: 'DED',          // Football-Data.org competition code
  defaultHomeAdvantage: 1.23,          // Historical home win advantage multiplier
  defaultLeagueAvgGoals: 3.10,         // Average goals per match in this league
  defaultLeagueAvgCorners: 10.3,       // Average corners per match
  defaultLeagueAvgCards: 3.4,          // Average cards per match
  currentSeason: 2024,
}
```
The new league will automatically appear in the horizontal league tabs, fixtures endpoint, and prediction models!

---

## 🧪 Unit Tests

Run the test suite covering Dixon-Coles Poisson distributions, matrix normalization ($\sum P = 1.0$), Negative Binomial distributions, odds de-overrounding, and market derivations:

```bash
npm test
```

Test coverage includes:
- `tests/dixon-coles.test.ts`: Poisson PMF, $\tau(x,y)$ adjustment, 11x11 matrix sum to 1.0, exponentially weighted team strengths.
- `tests/distributions.test.ts`: Negative Binomial PMF, distribution convolution for corners and cards, Over 7.5 probability.
- `tests/markets.test.ts`: 1X2 sum to 1.0, Double chance components, Over/Under 2.5 sum to 1.0, BTTS Yes/No sum to 1.0.
- `tests/odds-blend.test.ts`: Margin removal, market de-overrounding, Bayesian probability blending.
- `tests/e2e-routes.test.ts`: End-to-end fixture retrieval and market generation.

---

## 📊 Backtest Script & Probability Calibration

To evaluate model accuracy and verify that **"70% picks really win about 70% of the time"**, run the backtesting script:

```bash
npm run backtest
```

### Calibration Metrics Reported:
- **Total Historical Matches Evaluated**: 200 matches.
- **1X2 Accuracy & Brier Score**: Evaluated against uninformative baseline (0.667). Lower Brier score indicates superior probabilistic accuracy.
- **Over/Under 2.5 Goals Accuracy & Brier Score**.
- **Both Teams to Score (BTTS) Accuracy & Brier Score**.
- **10-Bin Calibration Table**:
  Groups predictions into 10% probability brackets (0–10%, 10–20%, ..., 70–80%, 80–90%, 90–100%) and compares the average predicted probability against the empirical win frequency.

You can also view this interactively in the web app by clicking the **"Backtest"** button in the top navigation bar.

---

## 🌐 Free Deployment Instructions

Matchday Edge can be deployed 100% free with a single click.

### Option 1: Render.com (Recommended Free Hosting)
1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `API_FOOTBALL_KEY`: *(optional, leave blank for Mock provider)*
6. Click **Deploy Web Service**. Render builds both the Express backend and the Vite React frontend, and serves the static PWA automatically.

### Option 2: Railway.app
1. Create a new project on [Railway.app](https://railway.app).
2. Deploy from GitHub repository.
3. Railway automatically detects `package.json` and runs `npm run build` and `npm start`.

---

## ⚖️ Legal & Responsible Betting Disclaimer

> **18+ Only.** Predictions provided by Matchday Edge are statistical probabilities derived from mathematical modeling (Dixon-Coles bivariate Poisson distributions and Negative Binomial corner/card distributions). They are **not guarantees** of match outcomes. Matchday Edge is an analytical research and educational tool; it is not a gambling operator. Bet responsibly and never risk money you cannot afford to lose.
