import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface WaterfallChartProps {
  startValue: number;
  increases: number;
  decreases: number;
  endValue: number;
}

export function WaterfallChart({ startValue, increases, decreases, endValue }: WaterfallChartProps) {
  // True waterfall chart with floating segments using stacked bars
  const data = [
    {
      name: 'Prior Month',
      invisible: 0,
      value: startValue,
      displayValue: startValue,
      fill: 'hsl(var(--primary))',
      label: 'Start',
    },
    {
      name: 'Increases',
      invisible: startValue,
      value: increases,
      displayValue: startValue + increases,
      fill: 'hsl(var(--success))',
      label: 'Inflows',
    },
    {
      name: 'Decreases',
      invisible: startValue + increases + decreases,
      value: Math.abs(decreases),
      displayValue: startValue + increases + decreases,
      fill: 'hsl(var(--destructive))',
      label: 'Outflows',
    },
    {
      name: 'Current Month',
      invisible: 0,
      value: endValue,
      displayValue: endValue,
      fill: 'hsl(var(--oxford-gold))',
      label: 'End',
    },
  ];

  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Portfolio Movement (Month-over-Month)</CardTitle>
        <CardDescription>Bridge from prior month to current month deposits</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={formatValue}
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">{data.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: {formatValue(data.displayValue)}
                      </p>
                      {data.name !== 'Prior Month' && data.name !== 'Current Month' && (
                        <p className="text-sm text-accent">
                          Change: {formatValue(data.name === 'Decreases' ? -data.value : data.value)}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="invisible" stackId="a" fill="transparent" />
            <Bar dataKey="value" stackId="a" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
