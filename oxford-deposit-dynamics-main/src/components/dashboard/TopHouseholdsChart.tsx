import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { HouseholdData } from "@/lib/data-processor";

interface TopHouseholdsChartProps {
  households: HouseholdData[];
}

export function TopHouseholdsChart({ households }: TopHouseholdsChartProps) {
  const data = [...households]
    .filter(h => h.householdName && h.householdName.trim() !== '')
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 10)
    .map(household => ({
      name: household.householdName.length > 20 
        ? household.householdName.substring(0, 17) + '...' 
        : household.householdName,
      fullName: household.householdName,
      balance: household.currentBalance,
      momChange: household.momChange,
      isPositive: household.momChange >= 0,
    }));

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  // Empty state check
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Households by Balance</CardTitle>
          <CardDescription>Largest accounts with MoM change direction</CardDescription>
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
        <CardTitle>Top 10 Households by Balance</CardTitle>
        <CardDescription>Largest accounts with MoM change direction</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 60, left: 140, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
            <XAxis 
              type="number" 
              tickFormatter={formatValue}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              width={130}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.fullName}</p>
                      <p className="text-sm text-muted-foreground">Balance: {formatValue(data.balance)}</p>
                      <p className={`text-sm font-medium ${data.isPositive ? 'text-success' : 'text-destructive'}`}>
                        MoM Change: {formatValue(data.momChange)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                  opacity={0.85}
                />
              ))}
              <LabelList 
                dataKey="balance" 
                position="right" 
                formatter={formatValue}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
