'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatNumber } from '@/lib/formatters';

export default function GexBarChart() {
  const { analytics: a, spotPrice: spot } = useActiveAsset();
  if (!a || !spot) return null;

  const data = a.gexByStrike.map(g => ({
    strike: g.strike,
    gex: g.gexCustomer / 1e6,
    smoothed: g.smoothed / 1e6,
  }));

  if (data.length === 0) return null;

  const minStrike = data[0].strike;
  const maxStrike = data[data.length - 1].strike;
  const gammaFlip = a.gammaFlip;

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Positive GEX
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Negative GEX
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> Smoothed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-emerald-500 inline-block" /> Spot
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0 border-t-2 border-dashed border-red-500 inline-block" /> GEX Flip
        </span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

          {/* Shaded gamma regions */}
          {!isNaN(gammaFlip) && (
            <>
              <ReferenceArea x1={minStrike} x2={gammaFlip} fill="#dbeafe" fillOpacity={0.05} />
              <ReferenceArea x1={gammaFlip} x2={maxStrike} fill="#fee2e2" fillOpacity={0.05} />
            </>
          )}

          <XAxis
            dataKey="strike"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `R$${formatNumber(v, 2)}`}
            stroke="#334155"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(1)}M`}
            stroke="#334155"
            label={{ value: 'Gamma Exposure (R$, millions)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12, color: '#facc15' }}
            labelFormatter={(v) => `Strike: R$ ${formatNumber(Number(v), 2)}`}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}M`,
              name === 'gex' ? 'GEX' : 'Smoothed',
            ]}
          />

          <Bar dataKey="gex" barSize={8} opacity={0.7}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.gex >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>

          <Line
            dataKey="smoothed"
            type="monotone"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />

          {/* Spot line */}
          <ReferenceLine x={spot} stroke="#10b981" strokeWidth={1.5} label={{ value: 'Spot', fill: '#10b981', fontSize: 11, position: 'top' }} />

          {/* Gamma Flip */}
          {!isNaN(gammaFlip) && (
            <ReferenceLine
              x={gammaFlip}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{ value: 'GEX Flip', fill: '#ef4444', fontSize: 11, position: 'top' }}
            />
          )}

          {/* Call Wall */}
          <ReferenceLine
            x={a.callWall}
            stroke="#6b7280"
            strokeDasharray="2 2"
            strokeWidth={1}
            label={{ value: 'Call Wall', fill: '#9ca3af', fontSize: 10, position: 'top' }}
          />

          {/* Put Wall */}
          <ReferenceLine
            x={a.putWall}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: 'Put Wall', fill: '#9ca3af', fontSize: 10, position: 'top' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
