import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { OfficerMetrics } from "@/lib/data-processor";

interface OfficerBarChartProps {
  officers: OfficerMetrics[];
}

export function OfficerBarChart({ officers }: OfficerBarChartProps) {
  const data = [...officers]
    .sort((a, b) => b.totalBalance - a.totalBalance)
    .map(officer => ({
      name: officer.officerName,
      balance: officer.totalBalance,
      momChange: officer.momChange,
      isPositive: officer.momChange >= 0,
    }));

  const dynamicHeight = Math.max(300, data.length * 40);

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Officer Portfolio Contribution</CardTitle>
        <CardDescription>Total portfolio size by officer, colored by MoM growth direction</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={dynamicHeight}>
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 80, left: 120, bottom: 5 }}
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
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              width={110}
            />
            <Tooltip 
              formatter={formatValue}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="balance" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                  opacity={0.8}
                />
              ))}
              <LabelList 
                dataKey="momChange" 
                position="right" 
                formatter={formatValue}
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
