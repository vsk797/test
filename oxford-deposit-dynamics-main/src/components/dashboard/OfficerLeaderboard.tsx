import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import { OfficerMetrics, formatCurrency } from "@/lib/data-processor";

interface OfficerLeaderboardProps {
  officers: OfficerMetrics[];
}

export function OfficerLeaderboard({ officers }: OfficerLeaderboardProps) {
  const sorted = [...officers].sort((a, b) => b.ytdChange - a.ytdChange);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <CardTitle>Officer Performance Leaderboard</CardTitle>
        </div>
        <CardDescription>Ranked by Year-to-Date growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((officer, index) => {
            const isPositive = officer.ytdChange >= 0;
            const rank = index + 1;
            const showMedal = rank <= 3;
            
            return (
              <div 
                key={officer.officerName}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    {showMedal ? (
                      <span className="text-2xl">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="font-bold text-muted-foreground">#{rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">
                        {officer.officerName}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {officer.householdCount} households
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Top Client: {officer.topHousehold}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-muted-foreground mb-1">Portfolio</p>
                    <p className="font-bold text-lg">{formatCurrency(officer.totalBalance)}</p>
                  </div>
                  
                  <div className="text-left lg:text-right min-w-[100px]">
                    <p className="text-xs text-muted-foreground mb-1">MoM Change</p>
                    <div className="flex items-center gap-1">
                      {officer.momChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <p className={`font-semibold ${officer.momChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(officer.momChange)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left lg:text-right min-w-[100px]">
                    <p className="text-xs text-muted-foreground mb-1">YTD Change</p>
                    <Badge 
                      variant={isPositive ? 'default' : 'destructive'}
                      className="font-bold"
                    >
                      {formatCurrency(officer.ytdChange)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
