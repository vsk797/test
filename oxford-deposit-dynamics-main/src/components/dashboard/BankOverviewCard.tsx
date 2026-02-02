import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BankSummary } from "@/lib/data-processor";

interface BankOverviewCardProps {
  bankSummary: BankSummary;
}

export function BankOverviewCard({ bankSummary }: BankOverviewCardProps) {
  const getBandColor = (ratio: number | null): string => {
    if (ratio === null) return 'text-muted-foreground';
    if (ratio >= 10) return 'text-success';
    if (ratio >= 5) return 'text-oxford-gold';
    return 'text-destructive';
  };

  const getBandLabel = (ratio: number | null): string => {
    if (ratio === null) return 'No Data';
    if (ratio >= 10) return 'Over 10%';
    if (ratio >= 5) return '5% to 9%';
    return 'Under 5%';
  };

  const getBandBg = (ratio: number | null): string => {
    if (ratio === null) return 'bg-muted/20';
    if (ratio >= 10) return 'bg-success/10';
    if (ratio >= 5) return 'bg-oxford-gold/10';
    return 'bg-destructive/10';
  };

  const getTrendIcon = (current: number | null, comparison: number | null) => {
    if (current === null || comparison === null) return null;
    const diff = current - comparison;
    if (Math.abs(diff) < 0.1) return null;
    return diff > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (current: number | null, comparison: number | null) => {
    if (current === null || comparison === null) return '';
    const diff = current - comparison;
    if (Math.abs(diff) < 0.1) return 'text-muted-foreground';
    return diff > 0 ? 'text-success' : 'text-destructive';
  };

  const formatRatio = (ratio: number | null): string => {
    if (ratio === null) return 'N/A';
    return `${ratio.toFixed(1)}%`;
  };

  return (
    <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg">Bank-Wide Liquidity Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Deposit to Loans Ratio Across All Portfolios</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Month */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Current Month</div>
            <div className="text-3xl font-bold text-foreground">
              {formatRatio(bankSummary.depositToLoansRatioCurrent)}
            </div>
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              getBandBg(bankSummary.depositToLoansRatioCurrent),
              getBandColor(bankSummary.depositToLoansRatioCurrent)
            )}>
              {getBandLabel(bankSummary.depositToLoansRatioCurrent)}
            </div>
            {bankSummary.depositToLoansRatioCurrent !== null && bankSummary.depositToLoansRatioPriorQuarter !== null && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                getTrendColor(bankSummary.depositToLoansRatioCurrent, bankSummary.depositToLoansRatioPriorQuarter)
              )}>
                {getTrendIcon(bankSummary.depositToLoansRatioCurrent, bankSummary.depositToLoansRatioPriorQuarter)}
                <span>
                  {Math.abs(bankSummary.depositToLoansRatioCurrent - bankSummary.depositToLoansRatioPriorQuarter).toFixed(1)}% vs PQ
                </span>
              </div>
            )}
          </div>

          {/* Prior Quarter */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Prior Quarter</div>
            <div className="text-3xl font-bold text-foreground">
              {formatRatio(bankSummary.depositToLoansRatioPriorQuarter)}
            </div>
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              getBandBg(bankSummary.depositToLoansRatioPriorQuarter),
              getBandColor(bankSummary.depositToLoansRatioPriorQuarter)
            )}>
              {getBandLabel(bankSummary.depositToLoansRatioPriorQuarter)}
            </div>
          </div>

          {/* Year-over-Year */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Year-over-Year</div>
            <div className="text-3xl font-bold text-foreground">
              {formatRatio(bankSummary.depositToLoansRatioYOY)}
            </div>
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              getBandBg(bankSummary.depositToLoansRatioYOY),
              getBandColor(bankSummary.depositToLoansRatioYOY)
            )}>
              {getBandLabel(bankSummary.depositToLoansRatioYOY)}
            </div>
            {bankSummary.depositToLoansRatioCurrent !== null && bankSummary.depositToLoansRatioYOY !== null && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                getTrendColor(bankSummary.depositToLoansRatioCurrent, bankSummary.depositToLoansRatioYOY)
              )}>
                {getTrendIcon(bankSummary.depositToLoansRatioCurrent, bankSummary.depositToLoansRatioYOY)}
                <span>
                  {Math.abs(bankSummary.depositToLoansRatioCurrent - bankSummary.depositToLoansRatioYOY).toFixed(1)}% vs YOY
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
