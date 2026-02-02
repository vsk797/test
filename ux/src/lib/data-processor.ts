import * as XLSX from 'xlsx';
import { TEAM_DEFINITIONS, getOfficerTeam } from './team-config';

export interface HouseholdData {
  householdId: string;
  householdName: string;
  officerCode: string;
  officerName: string;
  depositToLoansRatioCurrent: number | null;
  depositToLoansRatioPrior: number | null;
  depositToLoansRatioYTD: number | null;
  currentBalance: number;
  priorBalance: number;
  ytdBalance: number;
  momChange: number;
  ytdChange: number;
}

export interface DataQualityIssue {
  rowIndex: number;
  householdId: string;
  householdName: string;
  issueType: 'totals_row' | 'empty_name' | 'zero_balance' | 'excel_error' | 'extreme_ratio' | 'swapped_fields';
  field?: string;
  rawValue?: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

export interface BankSummary {
  depositToLoansRatioCurrent: number | null;  // E1084
  depositToLoansRatioPriorQuarter: number | null;  // F1084
  depositToLoansRatioYOY: number | null;  // G1084
}

export interface DataLoadResult {
  data: HouseholdData[];
  issues: DataQualityIssue[];
  bankSummary: BankSummary;
  stats: {
    totalRows: number;
    validRows: number;
    filteredRows: number;
  };
}

export interface OfficerMetrics {
  officerName: string;
  officerCode: string;
  totalBalance: number;
  momChange: number;
  ytdChange: number;
  avgRatio: number;
  householdCount: number;
  topHousehold: string;
}

export interface TeamMetrics {
  teamName: string;
  totalBalance: number;
  momChange: number;
  ytdChange: number;
  avgRatio: number;
  officerCount: number;
  householdCount: number;
  topOfficer: string;
  topOfficerBalance: number;
}

// Fix swapped Officer Name/Code columns
function normalizeOfficerData(code: string, name: string): { code: string; name: string } {
  // If code contains letters (not just numbers), it's likely the name
  const codeIsName = /[a-zA-Z]/.test(code);
  const nameIsCode = /^\d+$/.test(name);
  
  if (codeIsName && nameIsCode) {
    return { code: name, name: code };
  }
  return { code, name };
}

// Parse currency strings like "$33,327,940" or "$(1,607,943)"
function parseCurrency(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  
  const cleaned = value.toString().replace(/[$,]/g, '');
  if (cleaned.includes('(') && cleaned.includes(')')) {
    return -parseFloat(cleaned.replace(/[()]/g, ''));
  }
  return parseFloat(cleaned) || 0;
}

// Parse percentage strings like "2443%" or empty
function parsePercentage(value: string | number): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  
  const strValue = value.toString();
  // Handle Excel errors like #DIV/0!, #N/A, #VALUE!, #REF!
  if (strValue.startsWith('#')) return null;
  
  const cleaned = strValue.replace('%', '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Robust column name matcher with flexible matching
function getColumnValue(row: any, possibleNames: string[]): any {
  // Try exact match first
  for (const name of possibleNames) {
    if (row[name] !== undefined) return row[name];
  }
  
  // Try case-insensitive and trimmed match
  const rowKeys = Object.keys(row);
  for (const name of possibleNames) {
    const normalizedName = name.trim().toLowerCase();
    const matchedKey = rowKeys.find(k => k.trim().toLowerCase() === normalizedName);
    if (matchedKey !== undefined) return row[matchedKey];
  }
  
  return undefined;
}

export async function loadHouseholdData(): Promise<DataLoadResult> {
  const response = await fetch('/data/household-balance-report.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(firstSheet);
  
  const issues: DataQualityIssue[] = [];
  const totalRows = rawData.length;
  let filteredRows = 0;
  
  // Capture bank-wide summary from totals row before filtering
  let bankSummary: BankSummary = {
    depositToLoansRatioCurrent: null,
    depositToLoansRatioPriorQuarter: null,
    depositToLoansRatioYOY: null
  };
  
  const totalsRow = rawData.find((row: any) => {
    const householdId = getColumnValue(row, ['Household ID'])?.toString().toLowerCase() || '';
    return householdId === 'totals' || householdId === 'total';
  });
  
  if (totalsRow) {
    bankSummary = {
      depositToLoansRatioCurrent: parsePercentage(getColumnValue(totalsRow, ['% of Deposits to Loans (Current)'])),
      depositToLoansRatioPriorQuarter: parsePercentage(getColumnValue(totalsRow, ['% of Deposits to Loans (Prior)'])),
      depositToLoansRatioYOY: parsePercentage(getColumnValue(totalsRow, ['% of Deposits to Loans (YTD)']))
    };
  }
  
  const households = rawData.map((row: any, index: number) => {
    const rawOfficerCode = getColumnValue(row, ['Officer Code'])?.toString() || '';
    const rawOfficerName = getColumnValue(row, ['Officer Name'])?.toString() || '';
    const normalized = normalizeOfficerData(rawOfficerCode, rawOfficerName);
    
    // Track if officer name/code were swapped
    if (rawOfficerCode !== normalized.code || rawOfficerName !== normalized.name) {
      issues.push({
        rowIndex: index + 2,
        householdId: getColumnValue(row, ['Household ID'])?.toString() || '',
        householdName: getColumnValue(row, ['Household Name']) || '',
        issueType: 'swapped_fields',
        field: 'Officer Name/Code',
        rawValue: `${rawOfficerName} / ${rawOfficerCode}`,
        description: 'Officer name and code were swapped - corrected automatically',
        severity: 'info'
      });
    }
    
    // Parse ratio fields and check for Excel errors
    const rawRatioCurrent = getColumnValue(row, ['% of Deposits to Loans (Current)']);
    const rawRatioPrior = getColumnValue(row, ['% of Deposits to Loans (Prior)']);
    const rawRatioYTD = getColumnValue(row, ['% of Deposits to Loans (YTD)']);
    
    [
      { field: 'Current Ratio', value: rawRatioCurrent },
      { field: 'Prior Month Ratio', value: rawRatioPrior },
      { field: 'YTD Ratio', value: rawRatioYTD }
    ].forEach(({ field, value }) => {
      if (value && value.toString().startsWith('#')) {
        issues.push({
          rowIndex: index + 2,
          householdId: getColumnValue(row, ['Household ID'])?.toString() || '',
          householdName: getColumnValue(row, ['Household Name']) || '',
          issueType: 'excel_error',
          field,
          rawValue: value.toString(),
          description: `Excel formula error (${value}) in ${field} - treated as null`,
          severity: 'warning'
        });
      }
    });
    
    const depositToLoansRatioCurrent = parsePercentage(rawRatioCurrent);
    const depositToLoansRatioPrior = parsePercentage(rawRatioPrior);
    const depositToLoansRatioYTD = parsePercentage(rawRatioYTD);
    
    // Check for extreme ratios
    if (depositToLoansRatioCurrent !== null && depositToLoansRatioCurrent > 1000) {
      issues.push({
        rowIndex: index + 2,
        householdId: getColumnValue(row, ['Household ID'])?.toString() || '',
        householdName: getColumnValue(row, ['Household Name']) || '',
        issueType: 'extreme_ratio',
        field: 'Current Ratio',
        rawValue: `${depositToLoansRatioCurrent.toFixed(0)}%`,
        description: `Extreme ratio value (${depositToLoansRatioCurrent.toFixed(0)}%) - may skew averages`,
        severity: 'warning'
      });
    }
    
    const currentBalance = parseCurrency(getColumnValue(row, [
      'Current Month-end Deposit Balance',
      'Current Month-End Deposit Balance',
      'Current Monthend Deposit Balance'
    ]));
    
    const priorBalance = parseCurrency(getColumnValue(row, [
      'Prior Month-end Deposit Balance',
      'Prior Month-End Deposit Balance',
      'Prior Monthend Deposit Balance'
    ]));
    
    const ytdBalance = parseCurrency(getColumnValue(row, [
      'Prior Year-end Deposit Balance',
      'Prior Year-End Deposit Balance',
      'Prior Yearend Deposit Balance'
    ]));
    
    return {
      householdId: getColumnValue(row, ['Household ID'])?.toString() || '',
      householdName: getColumnValue(row, ['Household Name']) || '',
      officerCode: normalized.code,
      officerName: normalized.name,
      depositToLoansRatioCurrent,
      depositToLoansRatioPrior,
      depositToLoansRatioYTD,
      currentBalance,
      priorBalance,
      ytdBalance,
      momChange: parseCurrency(getColumnValue(row, ['Deposit Balance Change Month-over-Month'])),
      ytdChange: parseCurrency(getColumnValue(row, ['Deposit Balance Change Year-to-date'])),
    };
  }).filter((household, index) => {
    // Check for various data quality issues
    const householdIdLower = household.householdId.toLowerCase();
    
    // Check for totals row
    if (householdIdLower === 'totals' || householdIdLower === 'total') {
      filteredRows++;
      issues.push({
        rowIndex: index + 2,
        householdId: household.householdId,
        householdName: household.householdName || '(empty)',
        issueType: 'totals_row',
        description: 'Summary/totals row - filtered from analysis',
        severity: 'error'
      });
      return false;
    }
    
    // Check for empty household name
    if (!household.householdName || household.householdName.trim() === '') {
      filteredRows++;
      issues.push({
        rowIndex: index + 2,
        householdId: household.householdId,
        householdName: '(empty)',
        issueType: 'empty_name',
        description: 'Empty household name - filtered from analysis',
        severity: 'error'
      });
      return false;
    }
    
    // Check for zero-balance inactive accounts
    if (household.currentBalance === 0 && 
        household.priorBalance === 0 && 
        household.ytdBalance === 0) {
      filteredRows++;
      issues.push({
        rowIndex: index + 2,
        householdId: household.householdId,
        householdName: household.householdName,
        issueType: 'zero_balance',
        description: 'Inactive account with zero balance across all periods - filtered from analysis',
        severity: 'warning'
      });
      return false;
    }
    
    return true;
  });

  return {
    data: households,
    issues,
    bankSummary,
    stats: {
      totalRows,
      validRows: households.length,
      filteredRows
    }
  };
}

export function calculateOfficerMetrics(data: HouseholdData[]): OfficerMetrics[] {
  const officerMap = new Map<string, {
    totalBalance: number;
    momChange: number;
    ytdChange: number;
    ratios: number[];
    households: string[];
    topHouseholdValue: number;
    topHouseholdName: string;
  }>();
  
  data.forEach(household => {
    if (!household.officerName) return;
    
    const existing = officerMap.get(household.officerName) || {
      totalBalance: 0,
      momChange: 0,
      ytdChange: 0,
      ratios: [],
      households: [],
      topHouseholdValue: 0,
      topHouseholdName: '',
    };
    
    existing.totalBalance += household.currentBalance;
    existing.momChange += household.momChange;
    existing.ytdChange += household.ytdChange;
    existing.households.push(household.householdName);
    
    if (household.depositToLoansRatioCurrent !== null) {
      existing.ratios.push(household.depositToLoansRatioCurrent);
    }
    
    if (household.currentBalance > existing.topHouseholdValue) {
      existing.topHouseholdValue = household.currentBalance;
      existing.topHouseholdName = household.householdName;
    }
    
    officerMap.set(household.officerName, existing);
  });
  
  return Array.from(officerMap.entries()).map(([name, metrics]) => ({
    officerName: name,
    officerCode: data.find(d => d.officerName === name)?.officerCode || '',
    totalBalance: metrics.totalBalance,
    momChange: metrics.momChange,
    ytdChange: metrics.ytdChange,
    avgRatio: metrics.ratios.length > 0 
      ? metrics.ratios.reduce((a, b) => a + b, 0) / metrics.ratios.length 
      : 0,
    householdCount: metrics.households.length,
    topHousehold: metrics.topHouseholdName,
  }));
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(0)}%`;
}

// Calculate outlier thresholds using IQR method
export function calculateOutlierThreshold(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: -Infinity, max: Infinity };
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  return {
    min: q1 - 2.5 * iqr,
    max: q3 + 2.5 * iqr,
  };
}

// Apply officer filters
export function applyOfficerFilters(
  officers: OfficerMetrics[],
  filters: {
    topN: number | 'all';
    minBalance: number;
    excludeOutliers: boolean;
    balanceTier: 'all' | 'mega' | 'large' | 'medium' | 'small';
    team: 'all' | string;
    officer: 'all' | string;
  }
): OfficerMetrics[] {
  let filtered = [...officers];
  
  // Filter by team first
  if (filters.team !== 'all') {
    filtered = filtered.filter(o => getOfficerTeam(o.officerName) === filters.team);
  }
  
  // Filter by specific officer
  if (filters.officer !== 'all') {
    filtered = filtered.filter(o => o.officerName === filters.officer);
  }
  
  // Filter by minimum balance
  if (filters.minBalance > 0) {
    filtered = filtered.filter(o => o.totalBalance >= filters.minBalance);
  }
  
  // Exclude outliers based on YTD change
  if (filters.excludeOutliers && filtered.length > 0) {
    const ytdValues = filtered.map(o => o.ytdChange);
    const threshold = calculateOutlierThreshold(ytdValues);
    filtered = filtered.filter(o => 
      o.ytdChange >= threshold.min && o.ytdChange <= threshold.max
    );
  }
  
  // Sort by total balance descending
  filtered.sort((a, b) => b.totalBalance - a.totalBalance);
  
  // Apply topN filter
  if (filters.topN !== 'all') {
    filtered = filtered.slice(0, filters.topN);
  }
  
  return filtered;
}

// Calculate team metrics
export function calculateTeamMetrics(officers: OfficerMetrics[]): TeamMetrics[] {
  const teamMap = new Map<string, {
    officers: OfficerMetrics[];
    totalBalance: number;
    momChange: number;
    ytdChange: number;
    ratios: number[];
    householdCount: number;
  }>();

  // Initialize all teams
  Object.keys(TEAM_DEFINITIONS).forEach(team => {
    teamMap.set(team, {
      officers: [],
      totalBalance: 0,
      momChange: 0,
      ytdChange: 0,
      ratios: [],
      householdCount: 0
    });
  });

  // Aggregate officers into teams
  officers.forEach(officer => {
    const team = getOfficerTeam(officer.officerName);
    const existing = teamMap.get(team)!;
    
    existing.officers.push(officer);
    existing.totalBalance += officer.totalBalance;
    existing.momChange += officer.momChange;
    existing.ytdChange += officer.ytdChange;
    existing.householdCount += officer.householdCount;
    
    if (officer.avgRatio > 0) {
      existing.ratios.push(officer.avgRatio);
    }
  });

  // Convert to TeamMetrics array
  return Array.from(teamMap.entries()).map(([teamName, metrics]) => {
    const topOfficer = metrics.officers.sort((a, b) => b.totalBalance - a.totalBalance)[0];
    
    return {
      teamName,
      totalBalance: metrics.totalBalance,
      momChange: metrics.momChange,
      ytdChange: metrics.ytdChange,
      avgRatio: metrics.ratios.length > 0
        ? metrics.ratios.reduce((a, b) => a + b, 0) / metrics.ratios.length
        : 0,
      officerCount: metrics.officers.length,
      householdCount: metrics.householdCount,
      topOfficer: topOfficer?.officerName || '',
      topOfficerBalance: topOfficer?.totalBalance || 0
    };
  });
}
