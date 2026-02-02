import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { HouseholdData, OfficerMetrics, formatCurrency } from "@/lib/data-processor";

interface NarrativeCardProps {
  households: HouseholdData[];
  officers: OfficerMetrics[];
}

export function NarrativeCard({ households, officers }: NarrativeCardProps) {
  // Find biggest loser
  const biggestLoser = [...households].sort((a, b) => a.ytdChange - b.ytdChange)[0];
  
  // Find top performer by MoM growth rate
  const topPerformer = [...officers]
    .filter(o => o.totalBalance > 0 && o.momChange !== 0)
    .sort((a, b) => {
      const aPriorBalance = a.totalBalance - a.momChange;
      const bPriorBalance = b.totalBalance - b.momChange;
      const aGrowthRate = aPriorBalance > 0 ? (a.momChange / aPriorBalance) * 100 : 0;
      const bGrowthRate = bPriorBalance > 0 ? (b.momChange / bPriorBalance) * 100 : 0;
      return bGrowthRate - aGrowthRate;
    })[0];
  
  const totalYTDChange = households.reduce((sum, h) => sum + h.ytdChange, 0);
  const growthRate = topPerformer && topPerformer.totalBalance > 0
    ? ((topPerformer.momChange / (topPerformer.totalBalance - topPerformer.momChange)) * 100).toFixed(0)
    : '0';
  
  // Handle edge cases
  if (!biggestLoser || !topPerformer) {
    return null;
  }

  return (
    <Card className="col-span-full bg-gradient-to-br from-accent/5 via-background to-background border-accent/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Executive Summary</h3>
            <p className="text-muted-foreground leading-relaxed">
              {totalYTDChange < 0 ? (
                <>
                  Deposits are <span className="font-semibold text-destructive">{formatCurrency(totalYTDChange)} YTD</span>, 
                  driven primarily by the <span className="font-semibold text-foreground">{biggestLoser?.householdName}</span> household 
                  ({formatCurrency(biggestLoser?.ytdChange || 0)}).
                </>
              ) : (
                <>
                  Deposits are <span className="font-semibold text-success">up {formatCurrency(totalYTDChange)} YTD</span>, 
                  showing strong portfolio growth.
                </>
              )}
              {' '}However, Officer <span className="font-semibold text-accent">{topPerformer?.officerName}</span> has achieved{' '}
              <span className="font-semibold text-success">{growthRate}% growth</span> in their portfolio this month,
              demonstrating excellent relationship management with {topPerformer?.householdCount} households.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
