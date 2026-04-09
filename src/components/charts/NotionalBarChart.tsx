'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { useActiveAsset } from '@/hooks/useActiveAsset';
import { formatNumber, formatCompact } from '@/lib/formatters';

export default function NotionalBarChart() {
  const { analytics: a, spotPrice: spot } = useActiveAsset();
  if (!a || !spot) return null;

  const data = a.notionalByStrike.map(n => ({
    strike: n.strike,
    Calls: n.callsVolFin,
    Puts: n.putsVolFin,
  }));

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" /> Calls
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Puts
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-emerald-500 inline-block" /> Spot
        </span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="strike"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `R$${formatNumber(v, 2)}`}
            stroke="#334155"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => formatCompact(v)}
            stroke="#334155"
            label={{ value: 'Notional Volume (R$)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(v) => `Strike: R$ ${formatNumber(Number(v), 2)}`}
            formatter={(value: number, name: string) => [
              `R$ ${formatCompact(value)}`,
              name,
            ]}
          />
          <Bar dataKey="Calls" stackId="a" fill="#2563eb" opacity={0.85} />
          <Bar dataKey="Puts" stackId="a" fill="#ef4444" opacity={0.85} />
          <ReferenceLine
            x={spot}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: 'Spot', fill: '#10b981', fontSize: 11, position: 'top' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
