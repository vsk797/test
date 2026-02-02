import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { HouseholdData } from "@/lib/data-processor";

interface LiquidityDistributionChartProps {
  households: HouseholdData[];
}

export function LiquidityDistributionChart({ households }: LiquidityDistributionChartProps) {
  const bands = [
    { name: 'Over 10%', min: 10, max: Infinity, color: 'hsl(var(--success))' },
    { name: '5% to 9%', min: 5, max: 10, color: 'hsl(var(--oxford-gold))' },
    { name: 'Under 5%', min: 0, max: 5, color: 'hsl(var(--destructive))' },
    { name: 'No Loan Data', min: null, max: null, color: 'hsl(var(--muted))' },
  ];

  const data = bands.map(band => {
    let householdsInBand: HouseholdData[];
    
    if (band.min === null) {
      householdsInBand = households.filter(h => h.depositToLoansRatioCurrent === null);
    } else {
      householdsInBand = households.filter(
        h => h.depositToLoansRatioCurrent !== null && 
             h.depositToLoansRatioCurrent! >= band.min && 
             h.depositToLoansRatioCurrent! < band.max
      );
    }
    
    const totalValue = householdsInBand.reduce((sum, h) => sum + h.currentBalance, 0);
    return {
      name: band.name,
      value: totalValue,
      count: householdsInBand.length,
      fill: band.color,
    };
  });

  const totalPortfolio = data.reduce((sum, d) => sum + d.value, 0);

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  const renderLabel = (entry: any) => {
    if (totalPortfolio === 0 || entry.value === 0) return '';
    const percent = ((entry.value / totalPortfolio) * 100).toFixed(0);
    return `${percent}%`;
  };

  // Empty state check
  if (households.length === 0 || totalPortfolio === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Health: Liquidity Distribution</CardTitle>
          <CardDescription>Deposits to Loans ratio across all households</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No household data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Health: Liquidity Distribution</CardTitle>
        <CardDescription>Deposits to Loans ratio across all households</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">{data.name}</p>
                      <p className="text-sm text-muted-foreground">Value: {formatValue(data.value)}</p>
                      <p className="text-sm text-muted-foreground">Count: {data.count} households</p>
                      <p className="text-sm text-accent font-medium">
                        {totalPortfolio > 0 ? ((data.value / totalPortfolio) * 100).toFixed(1) : 0}% of portfolio
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => `${value} (${entry.payload.count})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
