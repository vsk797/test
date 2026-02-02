import { useEffect, useState } from "react";
import { Wallet, Users, TrendingUp, Gauge, Activity, Target, AlertTriangle, ListTodo, Building2 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { WaterfallChart } from "@/components/dashboard/WaterfallChart";
import { OfficerScatterChart } from "@/components/dashboard/OfficerScatterChart";
import { OfficerBarChart } from "@/components/dashboard/OfficerBarChart";
import { TopHouseholdsChart } from "@/components/dashboard/TopHouseholdsChart";
import { LiquidityDistributionChart } from "@/components/dashboard/LiquidityDistributionChart";
import { MomentumComparisonChart } from "@/components/dashboard/MomentumComparisonChart";
import { AttritionTable } from "@/components/dashboard/AttritionTable";
import { OfficerLeaderboard } from "@/components/dashboard/OfficerLeaderboard";
import { NarrativeCard } from "@/components/dashboard/NarrativeCard";
import { DataQualityReport } from "@/components/dashboard/DataQualityReport";
import { DashboardFilters, FilterState, DEFAULT_FILTERS } from "@/components/dashboard/DashboardFilters";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { TeamPerformanceCard } from "@/components/dashboard/TeamPerformanceCard";
import { BankOverviewCard } from "@/components/dashboard/BankOverviewCard";
import { 
  loadHouseholdData, 
  calculateOfficerMetrics, 
  calculateTeamMetrics,
  applyOfficerFilters,
  formatCurrency,
  HouseholdData,
  OfficerMetrics,
  TeamMetrics,
  DataQualityIssue,
  BankSummary
} from "@/lib/data-processor";

const Index = () => {
  const [households, setHouseholds] = useState<HouseholdData[]>([]);
  const [officers, setOfficers] = useState<OfficerMetrics[]>([]);
  const [teams, setTeams] = useState<TeamMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataIssues, setDataIssues] = useState<DataQualityIssue[]>([]);
  const [dataStats, setDataStats] = useState({ totalRows: 0, validRows: 0, filteredRows: 0 });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [bankSummary, setBankSummary] = useState<BankSummary | null>(null);

  // Apply filters to officers
  const filteredOfficers = applyOfficerFilters(officers, filters);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await loadHouseholdData();
        const officerMetrics = calculateOfficerMetrics(result.data);
        const teamMetrics = calculateTeamMetrics(officerMetrics);
        
        setHouseholds(result.data);
        setOfficers(officerMetrics);
        setTeams(teamMetrics);
        setDataIssues(result.issues);
        setDataStats(result.stats);
        setBankSummary(result.bankSummary);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Oxford Nexus...</p>
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const totalDeposits = households.reduce((sum, h) => sum + h.currentBalance, 0);
  const priorDeposits = households.reduce((sum, h) => sum + h.priorBalance, 0);
  const momChange = households.reduce((sum, h) => sum + h.momChange, 0);
  const ytdChange = households.reduce((sum, h) => sum + h.ytdChange, 0);
  
  const momChangePercent = priorDeposits !== 0 ? (momChange / priorDeposits) * 100 : 0;
  const ytdChangePercent = households.reduce((sum, h) => sum + h.ytdBalance, 0) !== 0 
    ? (ytdChange / households.reduce((sum, h) => sum + h.ytdBalance, 0)) * 100 
    : 0;

  // Cap extreme ratios to prevent outliers from skewing the average
  const RATIO_CAP = 500; // Cap at 500% for reasonable averaging
  const avgRatio = households
    .filter(h => h.depositToLoansRatioCurrent !== null)
    .map(h => Math.min(h.depositToLoansRatioCurrent!, RATIO_CAP))
    .reduce((sum, ratio, _, arr) => sum + ratio / arr.length, 0);

  const increases = households.filter(h => h.momChange > 0).reduce((sum, h) => sum + h.momChange, 0);
  const decreases = households.filter(h => h.momChange < 0).reduce((sum, h) => sum + h.momChange, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Oxford Nexus</h1>
              <p className="text-sm text-muted-foreground">Executive Deposit & Relationship Intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">November 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Filters */}
        <DashboardFilters 
          filters={filters} 
          onChange={setFilters}
          officerCount={filteredOfficers.length}
          availableOfficers={officers.map(o => o.officerName).sort()}
        />

        {/* Bank Overview */}
        {bankSummary && <BankOverviewCard bankSummary={bankSummary} />}

        {/* Narrative Card */}
        <NarrativeCard households={households} officers={officers} />

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Deposit Portfolio"
            value={formatCurrency(totalDeposits)}
            change={momChangePercent}
            trend={momChange >= 0 ? 'up' : 'down'}
            subtitle="vs. prior month"
            icon={<Wallet className="h-5 w-5" />}
          />
          <KPICard
            title="Net Flow (MoM)"
            value={formatCurrency(momChange)}
            change={Math.abs(momChangePercent)}
            trend={momChange >= 0 ? 'up' : 'down'}
            subtitle="month-over-month"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Net Flow (YTD)"
            value={formatCurrency(ytdChange)}
            change={Math.abs(ytdChangePercent)}
            trend={ytdChange >= 0 ? 'up' : 'down'}
            subtitle="year-to-date"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Portfolio Liquidity"
            value={`${avgRatio.toFixed(0)}%`}
            subtitle="avg deposits to loans"
            icon={<Gauge className="h-5 w-5" />}
          />
        </div>

        {/* Portfolio Flow Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Portfolio Flow Analysis</h2>
          </div>
          <WaterfallChart
            startValue={priorDeposits}
            increases={increases}
            decreases={decreases}
            endValue={totalDeposits}
          />
        </div>

        {/* Team Performance Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Team Performance</h2>
          </div>
          <TeamPerformanceCard teams={teams} />
        </div>

        {/* Officer Performance Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Officer Performance</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OfficerBarChart officers={filteredOfficers} />
            <MomentumComparisonChart officers={filteredOfficers} />
          </div>
          
          <OfficerScatterChart officers={filteredOfficers} />
          <OfficerLeaderboard officers={filteredOfficers} />
        </div>

        {/* Concentration & Risk Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">Concentration & Risk</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopHouseholdsChart households={households} />
            <LiquidityDistributionChart households={households} />
          </div>
        </div>

        {/* Action Items: Attrition & Gains */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Action Items</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttritionTable households={households} type="decreasers" />
            <AttritionTable households={households} type="gainers" />
          </div>
        </div>

        {/* Data Quality Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-foreground">Data Quality Report</h2>
          </div>
          <DataQualityReport issues={dataIssues} stats={dataStats} />
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant households={households} officers={officers} />
    </div>
  );
};

export default Index;
