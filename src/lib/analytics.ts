import {
  OptionRow, AnalyticsResult, PcrRangeRow, NotionalRow,
  GexRow, GexZone, PinCandidate,
} from './types';
import { classifySentiment } from './formatters';

// Rolling mean (centered, min periods = 1)
function rollingMean(values: number[], window: number): number[] {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length, i + half + 1);
    const slice = values.slice(start, end);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// Group rows by strike, summing a field
function groupByStrike<T>(
  rows: OptionRow[],
  valueFn: (r: OptionRow) => number,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const r of rows) {
    map.set(r.strike, (map.get(r.strike) || 0) + valueFn(r));
  }
  return map;
}

export function computeAnalytics(data: OptionRow[], spot: number): AnalyticsResult {
  const calls = data.filter(r => r.tipo === 'CALL');
  const puts = data.filter(r => r.tipo === 'PUT');

  // ─── Global PCR ───
  const totalCalls = calls.reduce((s, r) => s + r.tit, 0);
  const totalPuts = puts.reduce((s, r) => s + r.tit, 0);
  const pcrGlobal = totalCalls > 0 ? totalPuts / totalCalls : NaN;
  const sentiment = classifySentiment(pcrGlobal);

  // ─── IV Skew ───
  const putsOtm = puts.filter(r => r.strike < spot && r.iv > 0);
  const callsOtm = calls.filter(r => r.strike > spot && r.iv > 0);
  const ivPutsOtm = putsOtm.length > 0
    ? (putsOtm.reduce((s, r) => s + r.iv, 0) / putsOtm.length) * 100
    : 0;
  const ivCallsOtm = callsOtm.length > 0
    ? (callsOtm.reduce((s, r) => s + r.iv, 0) / callsOtm.length) * 100
    : 0;
  const ivSkew = ivPutsOtm - ivCallsOtm;
// AJUSTAR OS NIVEIS 
  // ─── PCR by Strike Range (6 bins like MagicGamma) ───
  const bins: { low: number; high: number; label: string }[] = [
    { low: 0.95 * spot, high: 0.96 * spot, label: '95%-96%' },
    { low: 0.96 * spot, high: 0.98 * spot, label: '96%-98%' },
    { low: 0.98 * spot, high: 1.00 * spot, label: '98%-100%' },
    { low: 1.00 * spot, high: 1.01 * spot, label: '100%-101% (ATM)' },
    { low: 1.01 * spot, high: 1.02 * spot, label: '101%-102%' },
    { low: 1.02 * spot, high: 1.04 * spot, label: '102%-104%' },
  ];

  const pcrByRange: PcrRangeRow[] = bins.map(({ low, high, label }) => {
    const c = calls
      .filter(r => r.strike >= low && r.strike < high)
      .reduce((s, r) => s + r.tit, 0);
    const p = puts
      .filter(r => r.strike >= low && r.strike < high)
      .reduce((s, r) => s + r.tit, 0);
    const pcr = c > 0 ? p / c : NaN;
    return { label, callsOi: c, putsOi: p, pcr, sentiment: classifySentiment(pcr) };
  });

  // ─── Notional by Strike ───
  const callsVolMap = groupByStrike(calls, r => r.volFin);
  const putsVolMap = groupByStrike(puts, r => r.volFin);
  const allStrikes = Array.from(
    new Set([...callsVolMap.keys(), ...putsVolMap.keys()])
  ).sort((a, b) => a - b);

  const notionalByStrike: NotionalRow[] = allStrikes.map(strike => ({
    strike,
    callsVolFin: callsVolMap.get(strike) || 0,
    putsVolFin: putsVolMap.get(strike) || 0,
  }));

  // ─── Gamma Exposure ───
  // GEX_customer = Gamma * spot^2 * Tit * (CALL=+1, PUT=-1)
  // GEX_dealer = -GEX_customer
  const spotSq = spot * spot;
  const gexMap = new Map<number, { customer: number; dealer: number }>();
  for (const r of data) {
    const sign = r.tipo === 'CALL' ? 1 : -1;
    const gexCustomer = r.gamma * spotSq * r.tit * sign;
    const prev = gexMap.get(r.strike) || { customer: 0, dealer: 0 };
    gexMap.set(r.strike, {
      customer: prev.customer + gexCustomer,
      dealer: prev.dealer - gexCustomer,
    });
  }

  const gexStrikes = Array.from(gexMap.keys()).sort((a, b) => a - b);
  const gexCustomerValues = gexStrikes.map(s => gexMap.get(s)!.customer);
  const smoothed = rollingMean(gexCustomerValues, 3);

  const gexByStrike: GexRow[] = gexStrikes.map((strike, i) => ({
    strike,
    gexCustomer: gexMap.get(strike)!.customer,
    gexDealer: gexMap.get(strike)!.dealer,
    smoothed: smoothed[i],
  }));

  // ─── Call/Put Walls ───
  const callTitMap = groupByStrike(calls, r => r.tit);
  const putTitMap = groupByStrike(puts, r => r.tit);

  let callWall = 0;
  let callWallMax = 0;
  for (const [strike, tit] of callTitMap) {
    if (tit > callWallMax) { callWallMax = tit; callWall = strike; }
  }

  let putWall = 0;
  let putWallMax = 0;
  for (const [strike, tit] of putTitMap) {
    if (tit > putWallMax) { putWallMax = tit; putWall = strike; }
  }

  // ─── Gamma Flip (zero-crossing interpolado, mais próximo do spot) ───
  let gammaFlip = NaN;
  if (gexStrikes.length >= 2) {
    // Filtra valores válidos (finitos)
    const validIdx: number[] = [];
    for (let i = 0; i < gexStrikes.length; i++) {
      if (isFinite(gexStrikes[i]) && isFinite(smoothed[i])) validIdx.push(i);
    }
    const x = validIdx.map(i => gexStrikes[i]);
    const y = validIdx.map(i => smoothed[i]);

    if (x.length >= 2) {
      // 1) Zeros exatos: onde smooth ≈ 0 → pega o mais próximo do spot
      const exactZeros: number[] = [];
      for (let i = 0; i < y.length; i++) {
        if (Math.abs(y[i]) < 1e-10) exactZeros.push(i);
      }

      // 2) Mudanças de sinal: sign(y[i]) * sign(y[i+1]) < 0
      const signChanges: number[] = [];
      for (let i = 0; i < y.length - 1; i++) {
        if (Math.sign(y[i]) * Math.sign(y[i + 1]) < 0) signChanges.push(i);
      }

      if (exactZeros.length > 0) {
        // Prioridade 1: zero exato mais próximo do spot
        let bestIdx = exactZeros[0];
        let bestDist = Math.abs(x[bestIdx] - spot);
        for (const idx of exactZeros) {
          const dist = Math.abs(x[idx] - spot);
          if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
        }
        gammaFlip = x[bestIdx];
      } else if (signChanges.length > 0) {
        // Prioridade 2: mudança de sinal mais próxima do spot, com interpolação linear
        let bestIdx = signChanges[0];
        let bestDist = Math.abs((x[bestIdx] + x[bestIdx + 1]) / 2 - spot);
        for (const idx of signChanges) {
          const mid = (x[idx] + x[idx + 1]) / 2;
          const dist = Math.abs(mid - spot);
          if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
        }
        const x1 = x[bestIdx], x2 = x[bestIdx + 1];
        const y1 = y[bestIdx], y2 = y[bestIdx + 1];
        if (Math.abs(y2 - y1) > 1e-10) {
          gammaFlip = x1 - y1 * (x2 - x1) / (y2 - y1); // interpolação linear
        } else {
          gammaFlip = (x1 + x2) / 2;
        }
      }
    }
  }

  // ─── Market Regime ───
  let regime: AnalyticsResult['regime'] = 'TRANSITION';
  let regimeRationale = 'Gamma Flip não encontrado';
  let regimeStrategy = 'N/A';
  if (!isNaN(gammaFlip)) {
    if (spot >= gammaFlip * 1.05) {
      regime = 'ALTA VOLATILIDADE';
      regimeRationale = 'Dealers short gamma — hedging amplifica movimentos.';
      regimeStrategy = 'Long gamma, setups direcionais ou de convexidade.';
    } else if (spot <= gammaFlip * 0.95) {
      regime = 'BAIXA VOLATILIDADE';
      regimeRationale = 'Dealers long gamma — hedging absorve choques.';
      regimeStrategy = 'Range trading, venda de vol, spreads short gamma.';
    } else {
      regime = 'TRANSITION';
      regimeRationale = 'Mercado próximo ao flip — comportamento instável.';
      regimeStrategy = 'Neutro, calendários ou butterflies.';
    }
  }

  // ─── Support/Resistance Zones ───
  const gexSorted = [...gexByStrike].sort((a, b) => b.gexCustomer - a.gexCustomer);
  const strengthLabel = (v: number): GexZone['strength'] => {
    const abs = Math.abs(v / 1e6);
    if (abs > 200) return 'Strong';
    if (abs > 100) return 'Moderate';
    return 'Weak';
  };

  // For adaptive thresholds, use percentile-based approach
  const absValues = gexByStrike.map(g => Math.abs(g.gexCustomer));
  const maxAbs = Math.max(...absValues, 1);
  const adaptiveStrength = (v: number): GexZone['strength'] => {
    const ratio = Math.abs(v) / maxAbs;
    if (ratio > 0.5) return 'Strong';
    if (ratio > 0.2) return 'Moderate';
    return 'Weak';
  };

  const resistanceZones: GexZone[] = gexSorted
    .filter(g => g.gexCustomer > 0)
    .slice(0, 4)
    .map(g => ({
      strike: g.strike,
      gexMillions: g.gexCustomer / 1e6,
      strength: adaptiveStrength(g.gexCustomer),
    }));

  const supportZones: GexZone[] = gexSorted
    .filter(g => g.gexCustomer < 0)
    .slice(-4)
    .reverse()
    .map(g => ({
      strike: g.strike,
      gexMillions: g.gexCustomer / 1e6,
      strength: adaptiveStrength(g.gexCustomer),
    }));

  // ─── Pin Candidates (strikes with smallest |GEX|) ───
  const pinCandidates: PinCandidate[] = [...gexByStrike]
    .sort((a, b) => Math.abs(a.gexCustomer) - Math.abs(b.gexCustomer))
    .slice(0, 5)
    .map(g => ({ strike: g.strike, gexMillions: g.gexCustomer / 1e6 }));

  // ─── Centroids ───
  const weightedAvg = (
    rows: OptionRow[],
    weightFn: (r: OptionRow) => number,
  ): number => {
    let sumWeighted = 0;
    let sumWeight = 0;
    for (const r of rows) {
      const w = weightFn(r);
      if (w > 0) {
        sumWeighted += r.strike * w;
        sumWeight += w;
      }
    }
    return sumWeight > 0 ? sumWeighted / sumWeight : 0;
  };

  const centroidsOiCalls = weightedAvg(calls, r => r.tit);
  const centroidsOiPuts = weightedAvg(puts, r => r.tit);
  const centroidsGammaCalls = weightedAvg(calls, r => Math.abs(r.gamma * r.tit));
  const centroidsGammaPuts = weightedAvg(puts, r => Math.abs(r.gamma * r.tit));

  return {
    totalCalls, totalPuts, pcrGlobal, sentiment,
    ivPutsOtm, ivCallsOtm, ivSkew,
    pcrByRange,
    notionalByStrike,
    gexByStrike,
    callWall, putWall,
    gammaFlip,
    regime, regimeRationale, regimeStrategy,
    resistanceZones, supportZones,
    pinCandidates,
    centroidsOiCalls, centroidsOiPuts,
    centroidsGammaCalls, centroidsGammaPuts,
  };
}

// Generate text report for clipboard copy
export function generateTextReport(a: AnalyticsResult, asset: string, spot: number): string {
  const lines: string[] = [
    `===== GEX Report — ${asset} =====`,
    '',
    `Spot Price: R$ ${spot.toFixed(2)}`,
    `Gamma Flip: R$ ${a.gammaFlip.toFixed(2)}`,
    `Market Regime: ${a.regime}`,
    `Rationale: ${a.regimeRationale}`,
    '',
    `── Put/Call Ratio (Global): ${a.pcrGlobal.toFixed(2)} — ${a.sentiment}`,
    `Total Calls OI: ${a.totalCalls.toLocaleString('pt-BR')}`,
    `Total Puts OI: ${a.totalPuts.toLocaleString('pt-BR')}`,
    '',
    `── Volatility Skew`,
    `OTM Puts IV: ${a.ivPutsOtm.toFixed(2)}%`,
    `OTM Calls IV: ${a.ivCallsOtm.toFixed(2)}%`,
    `Net Skew: ${a.ivSkew.toFixed(2)}%`,
    '',
    `── Wall Estimates`,
    `Call Wall: R$ ${a.callWall.toFixed(2)}`,
    `Put Wall: R$ ${a.putWall.toFixed(2)}`,
    '',
    `── Centroids`,
    `OI Weighted — Calls: R$ ${a.centroidsOiCalls.toFixed(2)} | Puts: R$ ${a.centroidsOiPuts.toFixed(2)}`,
    `Gamma Weighted — Calls: R$ ${a.centroidsGammaCalls.toFixed(2)} | Puts: R$ ${a.centroidsGammaPuts.toFixed(2)}`,
    '',
    `── PCR by Strike Range`,
    ...a.pcrByRange.map(r =>
      `${r.label.padEnd(20)} Calls: ${String(r.callsOi).padStart(8)} | Puts: ${String(r.putsOi).padStart(8)} | PCR: ${r.pcr.toFixed(2)}`
    ),
    '',
    `── Resistance Zones (+GEX)`,
    ...a.resistanceZones.map(z =>
      `R$ ${z.strike.toFixed(2).padStart(10)} | ${(z.gexMillions >= 0 ? '+' : '') + z.gexMillions.toFixed(1)}M | ${z.strength}`
    ),
    '',
    `── Support Zones (-GEX)`,
    ...a.supportZones.map(z =>
      `R$ ${z.strike.toFixed(2).padStart(10)} | ${z.gexMillions.toFixed(1)}M | ${z.strength}`
    ),
    '',
    `── Pin Candidates (Dealer Long Trap)`,
    ...a.pinCandidates.map(p =>
      `R$ ${p.strike.toFixed(2).padStart(10)} | ${(p.gexMillions >= 0 ? '+' : '') + p.gexMillions.toFixed(1)}M GEX`
    ),
    '',
    `Strategy: ${a.regimeStrategy}`,
    '='.repeat(50),
  ];
  return lines.join('\n');
}
