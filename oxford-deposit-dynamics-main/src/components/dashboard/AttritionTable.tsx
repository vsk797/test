import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { HouseholdData, formatCurrency } from "@/lib/data-processor";

interface AttritionTableProps {
  households: HouseholdData[];
  type: 'decreasers' | 'gainers';
}

export function AttritionTable({ households, type }: AttritionTableProps) {
  const sorted = [...households]
    .filter(h => type === 'decreasers' ? h.momChange < 0 : h.momChange > 0)
    .sort((a, b) => type === 'decreasers' 
      ? a.momChange - b.momChange 
      : b.momChange - a.momChange
    )
    .slice(0, 10);

  const isDecreasers = type === 'decreasers';
  const icon = isDecreasers ? AlertCircle : TrendingUp;
  const iconColor = isDecreasers ? 'text-destructive' : 'text-success';
  const badgeVariant = isDecreasers ? 'destructive' : 'default';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isDecreasers ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <TrendingUp className="h-5 w-5 text-success" />
          )}
          <CardTitle>
            {isDecreasers ? 'Attrition Watchlist' : 'Top Gainers'}
          </CardTitle>
        </div>
        <CardDescription>
          {isDecreasers 
            ? 'Top 10 households with largest MoM outflows - Immediate action required'
            : 'Top 10 households with largest MoM inflows - Success stories'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((household, index) => {
            const changePercent = household.priorBalance !== 0 
              ? (household.momChange / household.priorBalance) * 100 
              : 0;
            
            return (
              <div 
                key={household.householdId} 
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`text-2xl font-bold ${iconColor} w-8 shrink-0`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {household.householdName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Officer: {household.officerName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  <div className="text-left lg:text-right">
                    <p className="text-sm text-muted-foreground">Ending Balance</p>
                    <p className="font-semibold">{formatCurrency(household.currentBalance)}</p>
                  </div>
                  <div className="text-left lg:text-right min-w-[100px]">
                    <Badge variant={badgeVariant} className="mb-1">
                      {formatCurrency(household.momChange)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {changePercent.toFixed(1)}% MoM
                    </p>
                  </div>
                  {isDecreasers && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 w-full lg:w-auto"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Create Task
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
