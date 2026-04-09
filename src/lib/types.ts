// Raw row from Excel after parsing
export interface OptionRow {
  ticker: string;
  tipo: 'CALL' | 'PUT';
  strike: number;
  ultimo: number;
  iv: number;           // decimal (0.39 = 39%)
  delta: number;
  gamma: number;
  thetaDollar: number;
  vega: number;
  tit: number;          // holders (OI long)
  lanc: number;         // writers (OI short)
  volFin: number;       // notional volume BRL
}

// PCR by strike range row
export interface PcrRangeRow {
  label: string;
  callsOi: number;
  putsOi: number;
  pcr: number;
  sentiment: string;
}

// Notional by strike
export interface NotionalRow {
  strike: number;
  callsVolFin: number;
  putsVolFin: number;
}

// GEX by strike
export interface GexRow {
  strike: number;
  gexCustomer: number;
  gexDealer: number;
  smoothed: number;
}

// GEX zone (support/resistance)
export interface GexZone {
  strike: number;
  gexMillions: number;
  strength: 'Strong' | 'Moderate' | 'Weak';
}

// Pin candidate
export interface PinCandidate {
  strike: number;
  gexMillions: number;
}

// Full analytics result
export interface AnalyticsResult {
  // Global PCR
  totalCalls: number;
  totalPuts: number;
  pcrGlobal: number;
  sentiment: string;

  // IV Skew
  ivPutsOtm: number;
  ivCallsOtm: number;
  ivSkew: number;

  // PCR by Strike Range
  pcrByRange: PcrRangeRow[];

  // Notional by Strike
  notionalByStrike: NotionalRow[];

  // GEX
  gexByStrike: GexRow[];

  // Walls
  callWall: number;
  putWall: number;

  // Gamma Flip
  gammaFlip: number;

  // Market Regime
  regime: 'ALTA VOLATILIDADE' | 'BAIXA VOLATILIDADE' | 'TRANSITION';
  regimeRationale: string;
  regimeStrategy: string;

  // Support/Resistance
  resistanceZones: GexZone[];
  supportZones: GexZone[];

  // Pin Candidates
  pinCandidates: PinCandidate[];

  // Centroids
  centroidsOiCalls: number;
  centroidsOiPuts: number;
  centroidsGammaCalls: number;
  centroidsGammaPuts: number;
}

// Asset tab (one per uploaded file)
export interface AssetTab {
  id: string;
  assetName: string;
  rawData: OptionRow[];
  spotPrice: number | null;
  analytics: AnalyticsResult | null;
}

// App state
export interface AppState {
  assetTabs: AssetTab[];
  activeAssetTabId: string | null;
  activeTab: TabId;
  isLoading: boolean;
  error: string | null;
}

export type TabId = 'volatilidade' | 'gex-profile' | 'notional' | 'pcr' | 'report';

export type AppAction =
  | { type: 'ADD_ASSET_TAB'; payload: { id: string; assetName: string; rawData: OptionRow[] } }
  | { type: 'REMOVE_ASSET_TAB'; payload: string }
  | { type: 'SELECT_ASSET_TAB'; payload: string }
  | { type: 'SET_ASSET_SPOT'; payload: { id: string; spotPrice: number } }
  | { type: 'SET_ASSET_ANALYTICS'; payload: { id: string; analytics: AnalyticsResult } }
  | { type: 'SET_ACTIVE_TAB'; payload: TabId }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };
