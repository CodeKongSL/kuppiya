import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttemptHistory } from "@/data/examData";

interface PerformanceChartProps {
  attempts: AttemptHistory[];
}

export const PerformanceChart = ({ attempts }: PerformanceChartProps) => {
  const chartData = attempts
    .slice(-10) // Last 10 attempts
    .map((attempt, index) => ({
      attempt: `#${index + 1}`,
      score: attempt.percentage,
      date: new Date(attempt.date).toLocaleDateString(),
    }));

  if (chartData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Your progress will appear here after completing exams</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No attempts yet. Start practicing!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
        <CardDescription>Track your improvement across attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="attempt" 
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
