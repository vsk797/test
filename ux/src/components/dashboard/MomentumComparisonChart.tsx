import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { OfficerMetrics } from "@/lib/data-processor";

interface MomentumComparisonChartProps {
  officers: OfficerMetrics[];
}

export function MomentumComparisonChart({ officers }: MomentumComparisonChartProps) {
  const data = [...officers]
    .sort((a, b) => b.ytdChange - a.ytdChange)
    .map(officer => ({
      name: officer.officerName.length > 12 
        ? officer.officerName.substring(0, 9) + '...' 
        : officer.officerName,
      fullName: officer.officerName,
      momChange: officer.momChange,
      ytdChange: officer.ytdChange,
    }));

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  const dynamicHeight = Math.max(300, data.length * 50);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Analysis: MoM vs YTD</CardTitle>
        <CardDescription>
          Compare monthly and yearly trends ({data.length} officers shown)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={dynamicHeight}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              tickFormatter={formatValue}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.fullName}</p>
                      <p className="text-sm text-primary">MoM: {formatValue(data.momChange)}</p>
                      <p className="text-sm text-accent">YTD: {formatValue(data.ytdChange)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
            <Bar 
              dataKey="momChange" 
              name="Month-over-Month" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              opacity={0.8}
            />
            <Bar 
              dataKey="ytdChange" 
              name="Year-to-Date" 
              fill="hsl(var(--oxford-gold))" 
              radius={[8, 8, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
