import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { OfficerMetrics } from "@/lib/data-processor";

interface OfficerScatterChartProps {
  officers: OfficerMetrics[];
}

export function OfficerScatterChart({ officers }: OfficerScatterChartProps) {
  // Filter out officers with no meaningful data
  const data = officers
    .filter(officer => officer.totalBalance > 0 && officer.avgRatio !== null && officer.avgRatio > 0)
    .map(officer => ({
      name: officer.officerName,
      balance: officer.totalBalance,
      ratio: Math.min(officer.avgRatio || 0, 150), // Cap ratio at 150% for better visualization
      growth: Math.abs(officer.ytdChange),
      isPositive: officer.ytdChange >= 0,
      ytdChange: officer.ytdChange,
    }));

  const maxBalance = data.length > 0 ? Math.max(...data.map(d => d.balance)) : 1;

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Officer Growth vs. Liquidity Matrix</CardTitle>
        <CardDescription>Portfolio size (X), Loan ratio (Y), Growth size (bubble), Green = Growth, Red = Attrition</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              dataKey="balance" 
              name="Portfolio Balance"
              tickFormatter={formatValue}
              domain={[0, maxBalance * 1.1]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              label={{ value: 'Portfolio Balance', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="number" 
              dataKey="ratio" 
              name="Deposits to Loans %"
              domain={[0, 150]}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              label={{ value: 'Deposits to Loans Ratio', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            />
            <ZAxis 
              type="number" 
              dataKey="growth" 
              range={[100, 2000]} 
              name="YTD Growth"
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.name}</p>
                      <p className="text-sm text-muted-foreground">Portfolio: {formatValue(data.balance)}</p>
                      <p className="text-sm text-muted-foreground">Loan Ratio: {data.ratio.toFixed(0)}%</p>
                      <p className={`text-sm font-medium ${data.isPositive ? 'text-success' : 'text-destructive'}`}>
                        YTD Change: {formatValue(data.ytdChange)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Officers" data={data}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                  opacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
