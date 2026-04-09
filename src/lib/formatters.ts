const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatMillions(value: number): string {
  const m = value / 1e6;
  const sign = m >= 0 ? '+' : '';
  return `${sign}${formatNumber(m, 1)}M`;
}

export function formatK(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${formatNumber(value / 1000, 1)}K`;
  }
  return numberFormatter.format(value);
}

export function classifySentiment(pcr: number): string {
  if (isNaN(pcr)) return '—';
  if (pcr > 1.1) return 'BAIXISTA';
  if (pcr >= 0.9) return 'NEUTRO';
  return 'ALTISTA';
}

export function sentimentColor(pcr: number): string {
  if (isNaN(pcr)) return 'text-slate-400';
  if (pcr > 1.1) return 'text-red-400';
  if (pcr >= 0.9) return 'text-yellow-400';
  return 'text-emerald-400';
}
