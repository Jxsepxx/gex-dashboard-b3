import * as XLSX from 'xlsx';
import { OptionRow } from './types';

// Column name mappings (opcoes.net.br export format)
// Keys are normalized: lowercased, trimmed, all whitespace collapsed, \xa0 removed
const COL_MAP: Record<string, string> = {
  'ticker': 'ticker',
  'tipo': 'tipo',
  'strike': 'strike',
  'ultimo': 'ultimo',
  'vol. impl. (%)': 'iv',
  'vol. impl.(%)': 'iv',
  'vol.impl.(%)': 'iv',
  'delta': 'delta',
  'gamma': 'gamma',
  'theta ($)': 'thetaDollar',
  'theta($)': 'thetaDollar',
  'vega': 'vega',
  'tit.': 'tit',
  'lanc.': 'lanc',
  'vol. financeiro': 'volFin',
  'vol.financeiro': 'volFin',
};

/**
 * Normaliza header: remove \xa0 (non-breaking space), trim, lowercase, collapse whitespace.
 * Ex: "Ticker\xa0\xa0\xa0" -> "ticker"
 *     "Vol. Impl. (%)"      -> "vol. impl. (%)"
 *     "Lanç."               -> "lanc."  (ç -> c)
 */
function normalizeHeader(h: string): string {
  return h
    .replace(/\u00a0/g, ' ')   // non-breaking space -> space
    .replace(/ç/g, 'c')         // ç -> c (for Lanç.)
    .replace(/ú/g, 'u')         // ú -> u (for Último)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === '' || v === '-') return NaN;
  if (typeof v === 'number') return v;
  // Handle Brazilian number format: "1.234,56" -> 1234.56
  const s = String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
  return parseFloat(s);
}

/**
 * Extrai o nome do ativo a partir do nome do arquivo.
 * "Opções ASAI3 - CALLs e PUTs.xlsx"  -> "ASAI3"
 * "PETR4.xlsx"                          -> "PETR4"
 * "Opções BOVA11 - CALLs e PUTs.xlsx"  -> "BOVA11"
 */
export function extractAssetFromFilename(filename: string): string {
  const name = filename.replace(/\.[^.]+$/, '');
  const match = name.match(/\b([A-Z]{4}\d{1,2})\b/i);
  if (match) return match[1].toUpperCase();
  return name.replace(/[^A-Za-z0-9]/g, '').substring(0, 10).toUpperCase();
}

/**
 * Detecta se a primeira linha do Excel é um título (não dados/headers).
 * O export do opcoes.net.br coloca o título "Opções XXX - ..." na primeira linha,
 * ocupando apenas 1 coluna, e os headers reais ficam na linha 2.
 */
function findHeaderRow(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

  // Check first row: if it has only 1 cell with content, it's a title row
  let firstRowCols = 0;
  for (let c = range.s.c; c <= Math.min(range.e.c, 30); c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
    if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
      firstRowCols++;
    }
  }

  // If first row has <= 2 filled cells, it's a title → headers on row 2 (index 1)
  if (firstRowCols <= 2) return 1;

  // Otherwise headers are on row 1 (index 0)
  return 0;
}

export function parseExcel(buffer: ArrayBuffer): OptionRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Detect if row 1 is a title (opcoes.net.br format)
  const headerRowIndex = findHeaderRow(sheet);

  // Convert sheet to JSON, using correct header row
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    range: headerRowIndex, // skip title row if present
  });

  if (rawData.length === 0) return [];

  // Map raw column headers to our normalized keys
  const firstRow = rawData[0];
  const headerMap: Record<string, string> = {};
  for (const rawKey of Object.keys(firstRow)) {
    const norm = normalizeHeader(rawKey);
    if (COL_MAP[norm]) {
      headerMap[rawKey] = COL_MAP[norm];
    }
  }

  // Debug: log unmapped columns (helps troubleshoot)
  if (Object.keys(headerMap).length === 0) {
    console.warn('[parser] No columns mapped! Raw headers:', Object.keys(firstRow));
    return [];
  }

  const rows: OptionRow[] = [];
  for (const raw of rawData) {
    const get = (field: string): unknown => {
      const key = Object.keys(headerMap).find(k => headerMap[k] === field);
      return key ? raw[key] : undefined;
    };

    const ticker = String(get('ticker') ?? '').trim();
    const tipoRaw = String(get('tipo') ?? '').trim().toUpperCase();
    const tipo = tipoRaw.includes('CALL') ? 'CALL' : tipoRaw.includes('PUT') ? 'PUT' : null;
    if (!tipo) continue;

    // Seguindo o Python: df['Strike'] = pd.to_numeric(df['Strike'], errors='coerce')/100
    const strike = toNumber(get('strike')) / 100;

    // Seguindo o Python: df['IV'] = pd.to_numeric(df['IV'], errors='coerce') / 100.0
    const iv = toNumber(get('iv')) / 100;

    const gamma = toNumber(get('gamma'));

    // Seguindo o Python: df = df.dropna(subset=['Strike', 'IV', 'Gamma'])
    if (isNaN(strike) || isNaN(gamma) || strike <= 0) continue;

    rows.push({
      ticker,
      tipo,
      strike,
      ultimo: toNumber(get('ultimo')),
      iv: isNaN(iv) ? 0 : iv,
      delta: toNumber(get('delta')) || 0,
      gamma,
      thetaDollar: toNumber(get('thetaDollar')) || 0,
      vega: toNumber(get('vega')) || 0,
      tit: toNumber(get('tit')) || 0,
      lanc: toNumber(get('lanc')) || 0,
      volFin: toNumber(get('volFin')) || 0,
    });
  }

  return rows;
}
