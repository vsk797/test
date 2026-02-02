import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/data-processor";
import { TeamMetrics } from "@/lib/data-processor";
import { TEAM_COLORS } from "@/lib/team-config";

interface TeamPerformanceCardProps {
  teams: TeamMetrics[];
}

export function TeamPerformanceCard({ teams }: TeamPerformanceCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {teams.map((team) => {
        const momPercent = team.totalBalance > 0 
          ? (team.momChange / (team.totalBalance - team.momChange)) * 100 
          : 0;
        const ytdPercent = team.totalBalance > 0
          ? (team.ytdChange / (team.totalBalance - team.ytdChange)) * 100
          : 0;

        return (
          <Card
            key={team.teamName}
            className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors"
          >
            {/* Team Header */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: TEAM_COLORS[team.teamName as keyof typeof TEAM_COLORS] }}
              />
              <h3 className="text-lg font-semibold text-foreground">{team.teamName}</h3>
            </div>

            {/* Total Balance */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(team.totalBalance)}</p>
            </div>

            {/* MoM & YTD Changes */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">MoM Change</p>
                <div className="flex items-center gap-2">
                  {team.momChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-accent" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Math.abs(team.momChange))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {momPercent >= 0 ? '+' : ''}{momPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">YTD Change</p>
                <div className="flex items-center gap-2">
                  {team.ytdChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-accent" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Math.abs(team.ytdChange))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ytdPercent >= 0 ? '+' : ''}{ytdPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Liquidity</p>
                <p className="text-lg font-semibold text-foreground">{team.avgRatio.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Households</p>
                <p className="text-lg font-semibold text-foreground">{team.householdCount}</p>
              </div>
            </div>

            {/* Team Composition */}
            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {team.officerCount} {team.officerCount === 1 ? 'officer' : 'officers'}
              </p>
            </div>

            {/* Top Officer */}
            {team.topOfficer && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3 w-3 text-accent" />
                  <p className="text-xs font-medium text-muted-foreground">Top Officer</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{team.topOfficer}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(team.topOfficerBalance)}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
