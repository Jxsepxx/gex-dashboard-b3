# GEX Dashboard B3

Browser-based dashboard for **gamma exposure (GEX)**, put/call ratio and implied-volatility skew of options listed on B3. Upload an options-chain file exported from [opcoes.net.br](https://opcoes.net.br), enter the spot price, and the analytics run locally — no backend, no data leaves the browser.

**Live demo:** https://gex-dashboard-eight.vercel.app

---

## What it shows

| Tab | Content |
| --- | --- |
| **Volatilidade** | IV skew, put/call ratio by strike range, sentiment label |
| **GEX Profile** | GEX by strike with a smoothed curve |
| **Notional** | Traded value (BRL) by strike |
| **PCR** | Put/call open-interest distribution |
| **Report** | Regime, call/put walls, centroids, GEX zones, pin candidates; copyable text report |

Multiple assets can be loaded and switched by tab.

## Calculations

### Gamma exposure

```
GEX_customer(strike) = Σ gamma × spot² × open_interest × sign
sign = +1 for calls, −1 for puts
GEX_dealer = −GEX_customer
Smoothed GEX = centered 3-strike rolling mean
```

### Gamma flip

Strike where the smoothed per-strike GEX changes sign, linearly interpolated, choosing the crossing closest to spot.

### Put/call ratio and skew

```
PCR  = Σ put OI / Σ call OI          (> 1.1 bearish · 0.9–1.1 neutral · < 0.9 bullish)
Skew = mean IV of OTM puts − mean IV of OTM calls
```

## Methodology notes and limitations

Read these before using the numbers.

- **Positioning assumption.** The sign convention assumes customers are long calls and short puts, so dealers hold the opposite. Open interest does not reveal who is long or short; on B3 this assumption is weaker than in US index options.
- **Gamma flip is approximated.** It is the zero crossing of GEX *by strike*. The usual definition is the spot level at which *total* GEX is zero, which requires recomputing every option's gamma across a grid of hypothetical spot prices. Planned for v2.
- **Gamma is taken from the input file**, not computed here. Results inherit the source's volatility and model assumptions.
- **Regime convention.** The dashboard labels spot above the flip as high volatility. Common practice (e.g. SpotGamma, SqueezeMetrics) treats spot above the flip as dealers long gamma and lower volatility. The choice depends on the positioning assumption above and should be read with it.
- **Units.** No contract multiplier or 1%-move normalization is applied, so GEX values are comparable across strikes of one chain, not across assets.
- **Pin candidates** are the strikes with the smallest absolute GEX. This is a heuristic, not a tested signal.

## Roadmap (v2)

- [ ] Black–Scholes gamma computed in-app from IV, rate and expiry
- [ ] Gamma flip on a spot grid (total GEX = 0)
- [ ] "Load sample" button with a bundled example chain
- [ ] Unit tests for `lib/analytics.ts` (Vitest) and CI on GitHub Actions
- [ ] Replace the npm `xlsx@0.18.5` package with a maintained SheetJS build

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Recharts · SheetJS

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and upload a `.xlsx` options chain from opcoes.net.br.

## Project structure

```
src/
├── app/page.tsx                 # Upload screen or dashboard
├── context/OptionsDataContext   # Global state (Context + useReducer)
├── hooks/                       # File upload, active asset, analytics trigger
├── lib/
│   ├── analytics.ts             # GEX, PCR, skew, gamma flip, regime
│   ├── parser.ts                # opcoes.net.br parser
│   ├── formatters.ts
│   └── types.ts
└── components/                  # Upload, layout, charts, sidebar, tabs, report
```

## License

MIT — see `LICENSE`.
