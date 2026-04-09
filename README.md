# GEX Dashboard B3

A client-side dashboard for analyzing **Gamma Exposure (GEX)** of options traded on Brazil's B3/Bovespa exchange. Upload an options chain spreadsheet from [opcoes.net.br](https://opcoes.net.br) and instantly get a full GEX analysis — no backend, no API keys required.

**Live demo:** https://gex-dashboard-eight.vercel.app

---

## What is GEX?

Gamma Exposure measures the **delta-hedging pressure** market makers (dealers) must exert on the underlying asset. It reveals:

- **Gamma Flip** — the price level where dealer behavior switches from volatility-absorbing (long gamma) to volatility-amplifying (short gamma)
- **Support/Resistance Zones** — strikes where dealer hedging creates structural price gravity
- **Market Regime** — `BAIXA VOLATILIDADE` / `TRANSITION` / `ALTA VOLATILIDADE`
- **Pin Candidates** — strikes where minimal GEX creates dealer-long traps near expiry

---

## Features

| Tab | Description |
|-----|-------------|
| **Volatilidade** | IV Skew, PCR by strike range, market sentiment |
| **GEX Profile** | Gamma Exposure bar chart by strike with smoothed curve |
| **Notional** | Financial volume (BRL) distribution by strike |
| **PCR** | Put/Call Ratio distribution chart |
| **Report** | Full analytical report: regime, walls, centroids, support/resistance, pin candidates |

**Sidebar** shows real-time widgets: Spot price, PCR ratio, Gamma Walls, IV Skew, Market Regime, Gamma Flip level, and Support/Resistance Zones.

Multi-asset support — upload multiple spreadsheets and switch between assets via tabs.

---

## Tech Stack

- **Next.js 15** + React 19 + TypeScript 5.7
- **Tailwind CSS 4** for styling
- **Recharts** for interactive charts
- **SheetJS/xlsx** for Excel parsing
- **Lucide React** for icons
- 100% client-side — zero backend, zero data leaves the browser

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Input Format

Upload a `.xlsx` file exported from [opcoes.net.br](https://opcoes.net.br) (options chain for any B3 asset). Enter the current spot price and the dashboard computes all analytics automatically.

---

## Core Analytics

### Gamma Exposure
```
GEX_customer = Gamma × Spot² × OI × sign
sign = +1 (CALL), −1 (PUT)
Smoothed GEX = centered 3-period rolling mean
```

### Gamma Flip (Zero-Crossing)
1. Finds exact zeros in smoothed GEX curve (`|y| < 1e-10`)
2. Falls back to linear interpolation at sign-change points
3. Returns the crossing closest to the current spot price

### Market Regime
```
Spot ≥ Gamma Flip × 1.05  →  ALTA VOLATILIDADE  (dealers short gamma)
Spot ≤ Gamma Flip × 0.95  →  BAIXA VOLATILIDADE (dealers long gamma)
Otherwise                  →  TRANSITION
```

### Put/Call Ratio
```
PCR = Total Puts OI / Total Calls OI
> 1.1 → BAIXISTA | 0.9–1.1 → NEUTRO | < 0.9 → ALTISTA
```

### IV Skew
```
OTM Puts IV  = mean IV of puts  with strike < spot
OTM Calls IV = mean IV of calls with strike > spot
Skew = OTM Puts IV − OTM Calls IV
```

---

## Project Structure

```
src/
├── app/
│   └── page.tsx                      # Root page: upload screen or dashboard
├── context/
│   └── OptionsDataContext.tsx         # Global state (React Context + useReducer)
├── hooks/
│   ├── useActiveAsset.ts              # Read-only hook for active asset data
│   ├── useFileUpload.ts               # Excel → OptionRow[] → dispatch
│   └── useOptionsAnalytics.ts         # Triggers analytics when rawData + spot are ready
├── lib/
│   ├── types.ts                       # All TypeScript interfaces
│   ├── analytics.ts                   # GEX, PCR, IV Skew, Gamma Flip, Regime
│   ├── parser.ts                      # opcoes.net.br Excel parser
│   └── formatters.ts                  # BRL formatting, sentiment labels
└── components/
    ├── upload/                        # FileUpload (drag & drop), SpotPriceInput
    ├── layout/                        # DashboardLayout, Sidebar, TabBar
    ├── charts/                        # GexBarChart, NotionalBarChart, PcrDistributionBar
    ├── sidebar/                       # Spot, PCR, GammaWalls, IvSkew, Regime, Zones widgets
    ├── tabs/                          # Volatilidade, GexProfile, Notional, PCR, Report tabs
    └── report/                        # Report section cards
```

---

## Deploy

```bash
npx vercel --prod
```

---

## License

MIT
