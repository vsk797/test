import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { HouseholdData } from "@/lib/data-processor";

interface BalanceTierChartProps {
  households: HouseholdData[];
}

export function BalanceTierChart({ households }: BalanceTierChartProps) {
  const tiers = [
    { name: 'Mega (>$1M)', min: 1_000_000, max: Infinity, color: 'hsl(var(--oxford-gold))' },
    { name: 'Large ($100K-$1M)', min: 100_000, max: 1_000_000, color: 'hsl(var(--success))' },
    { name: 'Medium ($10K-$100K)', min: 10_000, max: 100_000, color: 'hsl(var(--primary))' },
    { name: 'Small (<$10K)', min: 0, max: 10_000, color: 'hsl(var(--muted-foreground))' },
  ];

  const data = tiers.map(tier => {
    const householdsInTier = households.filter(
      h => h.currentBalance >= tier.min && h.currentBalance < tier.max
    );
    const totalValue = householdsInTier.reduce((sum, h) => sum + h.currentBalance, 0);
    return {
      name: tier.name,
      value: totalValue,
      count: householdsInTier.length,
      fill: tier.color,
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
          <CardTitle>Portfolio Concentration by Household Size</CardTitle>
          <CardDescription>Distribution of total portfolio across balance tiers</CardDescription>
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
        <CardTitle>Portfolio Concentration by Household Size</CardTitle>
        <CardDescription>Distribution of total portfolio across balance tiers</CardDescription>
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
                        {((data.value / totalPortfolio) * 100).toFixed(1)}% of portfolio
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
