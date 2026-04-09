'use client';

interface Props {
  callsOi: number;
  putsOi: number;
}

export default function PcrDistributionBar({ callsOi, putsOi }: Props) {
  const total = callsOi + putsOi;
  if (total === 0) return <div className="h-4 bg-slate-700 rounded" />;

  const callPct = (callsOi / total) * 100;
  const putPct = (putsOi / total) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <span>C</span>
        <div className="flex-1 flex h-2.5 rounded overflow-hidden bg-slate-700">
          <div className="bg-blue-500 h-full" style={{ width: `${callPct}%` }} />
          <div className="bg-red-500 h-full" style={{ width: `${putPct}%` }} />
        </div>
        <span>P</span>
      </div>
    </div>
  );
}
