import { 
  loadHouseholdData, 
  calculateOfficerMetrics, 
  calculateTeamMetrics, 
  HouseholdData, 
  OfficerMetrics, 
  TeamMetrics,
  DataQualityIssue,
  BankSummary
} from '@/lib/data-processor';

// Cache for the data so we don't re-parse the Excel file for every "API call"
let cachedData: {
  households: HouseholdData[];
  officers: OfficerMetrics[];
  teams: TeamMetrics[];
  issues: DataQualityIssue[];
  bankSummary: BankSummary | null;
  stats: any;
} | null = null;

// Helper to ensure data is loaded
async function ensureDataLoaded() {
  if (cachedData) return cachedData;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const result = await loadHouseholdData();
  const officerMetrics = calculateOfficerMetrics(result.data);
  const teamMetrics = calculateTeamMetrics(officerMetrics);
  
  cachedData = {
    households: result.data,
    officers: officerMetrics,
    teams: teamMetrics,
    issues: result.issues,
    bankSummary: result.bankSummary,
    stats: result.stats
  };
  
  return cachedData;
}

// --- Mock API Endpoints matching ux_component_spec.yaml ---

export interface KPIResponse {
  total_deposits: number;
  net_flow_mom: number;
  net_flow_ytd: number;
  liquidity_ratio: number;
  trends: {
    total_deposits_pct: number;
    net_flow_mom_pct: number;
    net_flow_ytd_pct: number;
  };
}

export const getKPIs = async (filters?: any): Promise<KPIResponse> => {
  const data = await ensureDataLoaded();
  
  // In a real API, filtering would happen on the server.
  // For now, we calculate bank-wide totals from the loaded data.
  // Note: This ignores filters for simplicity in this mock, 
  // but a real implementation would filter 'data.households' first.
  
  const totalDeposits = data.households.reduce((sum, h) => sum + h.currentBalance, 0);
  const priorDeposits = data.households.reduce((sum, h) => sum + h.priorBalance, 0);
  const momChange = data.households.reduce((sum, h) => sum + h.momChange, 0);
  const ytdChange = data.households.reduce((sum, h) => sum + h.ytdChange, 0);
  
  const momChangePercent = priorDeposits !== 0 ? (momChange / priorDeposits) * 100 : 0;
  const ytdBalance = data.households.reduce((sum, h) => sum + h.ytdBalance, 0);
  const ytdChangePercent = ytdBalance !== 0 ? (ytdChange / ytdBalance) * 100 : 0;

  // Cap extreme ratios logic from Index.tsx
  const RATIO_CAP = 500;
  const avgRatio = data.households
    .filter(h => h.depositToLoansRatioCurrent !== null)
    .map(h => Math.min(h.depositToLoansRatioCurrent!, RATIO_CAP))
    .reduce((sum, ratio, _, arr) => sum + ratio / arr.length, 0);

  return {
    total_deposits: totalDeposits,
    net_flow_mom: momChange,
    net_flow_ytd: ytdChange,
    liquidity_ratio: avgRatio,
    trends: {
      total_deposits_pct: momChangePercent, // Using MoM as the main trend for total deposits
      net_flow_mom_pct: Math.abs(momChangePercent),
      net_flow_ytd_pct: Math.abs(ytdChangePercent)
    }
  };
};

export interface WaterfallResponse {
  start_balance: number;
  increases: number;
  decreases: number;
  end_balance: number;
  details: { category: string; value: number }[];
}

export const getWaterfallData = async (): Promise<WaterfallResponse> => {
  const data = await ensureDataLoaded();
  
  const priorDeposits = data.households.reduce((sum, h) => sum + h.priorBalance, 0);
  const totalDeposits = data.households.reduce((sum, h) => sum + h.currentBalance, 0);
  
  const increases = data.households.filter(h => h.momChange > 0).reduce((sum, h) => sum + h.momChange, 0);
  const decreases = data.households.filter(h => h.momChange < 0).reduce((sum, h) => sum + h.momChange, 0);
  
  return {
    start_balance: priorDeposits,
    increases: increases,
    decreases: decreases,
    end_balance: totalDeposits,
    details: [
      { category: 'Increases', value: increases },
      { category: 'Decreases', value: decreases }
    ]
  };
};

export interface LeaderboardResponse {
  data: {
    officer_id: string;
    name: string;
    team: string; // We'd need to look this up or add it to OfficerMetrics
    balance: number;
    growth_ytd: number;
    liquidity_avg: number;
    household_count: number;
  }[];
}

export const getOfficerLeaderboard = async (metric?: string, sort?: string): Promise<LeaderboardResponse> => {
  const data = await ensureDataLoaded();
  
  // Transform OfficerMetrics to API response format
  const leaderboard = data.officers.map(o => ({
    officer_id: o.officerCode,
    name: o.officerName,
    team: "Unknown", // getOfficerTeam(o.officerName) is needed here if we want it
    balance: o.totalBalance,
    growth_ytd: o.ytdChange,
    liquidity_avg: o.avgRatio,
    household_count: o.householdCount
  }));
  
  return { data: leaderboard };
};

export interface FilterMetadataResponse {
  teams: string[];
  officers: { id: string; name: string; team: string }[];
  balance_tiers: string[];
}

export const getFilterMetadata = async (): Promise<FilterMetadataResponse> => {
  const data = await ensureDataLoaded();
  
  return {
    teams: data.teams.map(t => t.teamName),
    officers: data.officers.map(o => ({ 
      id: o.officerCode, 
      name: o.officerName, 
      team: 'Unknown' 
    })),
    balance_tiers: ['mega', 'large', 'medium', 'small']
  };
};

export interface NarrativeResponse {
  markdown_text: string;
  highlighted_entities: string[];
}

export const getNarrative = async (contextData: any): Promise<NarrativeResponse> => {
  // Mock AI response
  return {
    markdown_text: "Deposits are **up $5M**, driven primarily by **Business Banking** performance. **Oxford Capital Finance** showed slight attrition in the mid-market segment.",
    highlighted_entities: ["Business Banking", "Oxford Capital Finance"]
  };
};

export const getBankSummary = async (): Promise<BankSummary | null> => {
  const data = await ensureDataLoaded();
  return data.bankSummary;
};

export const getDataQualityReport = async () => {
  const data = await ensureDataLoaded();
  return {
    issues: data.issues,
    stats: data.stats
  };
};

// Also export raw data for components that haven't been fully refactored to use granular APIs
export const getRawHouseholds = async () => {
    const data = await ensureDataLoaded();
    return data.households;
}

export const getRawOfficers = async () => {
    const data = await ensureDataLoaded();
    return data.officers;
}

export const getRawTeams = async () => {
    const data = await ensureDataLoaded();
    return data.teams;
}
