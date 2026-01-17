import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Target, Award, Calendar, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Configuration constants
const MAX_CHART_POINTS = 30; // Limit chart to last 30 attempts for performance
const INITIAL_PAPERS_TO_SHOW = 3; // Show first 3 papers initially in dialog

interface DataPoint {
  date: string;
  percentage: number;
  correct_answers: number;
  total_answered: number;
  attempt_number: number;
}

interface PaperProgress {
  paper_id: string;
  data_points: DataPoint[];
  summary: {
    total_attempts: number;
    best_score: number;
    average_score: number;
    latest_score: number;
    improvement_rate: number;
  };
}

interface ProgressResponse {
  count: number;
  data: Record<string, PaperProgress>;
  message: string;
}

export const PerformanceChart = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<PaperProgress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visiblePapers, setVisiblePapers] = useState(INITIAL_PAPERS_TO_SHOW);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      // Add query parameters for backend optimization
      const params = new URLSearchParams({
        limit: MAX_CHART_POINTS.toString(), // Limit data points per paper
        days: '90', // Get last 90 days of data
      });
      
      const response = await fetch(
        `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Generate/Progress/Chart?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }

      const result: ProgressResponse = await response.json();
      
      // Convert the data object to an array
      const dataArray = Object.values(result.data);
      setProgressData(dataArray);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast({
        title: "Error",
        description: "Failed to load progress data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized chart data - only recalculate when progressData changes
  const chartData = useMemo(() => {
    // Aggregate all data points from all papers
    const allDataPoints = progressData.flatMap((paper) =>
      paper.data_points.map((point) => ({
        ...point,
        paper_id: paper.paper_id,
      }))
    );

    // Sort by date
    allDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Take only the last N attempts for performance
    const recentPoints = allDataPoints.slice(-MAX_CHART_POINTS);

    return recentPoints.map((point, index) => ({
      attempt: `#${allDataPoints.length - MAX_CHART_POINTS + index + 1}`,
      score: point.percentage,
      date: point.date,
      correct: point.correct_answers,
      total: point.total_answered,
    }));
  }, [progressData]);

  // Memoized overall statistics
  const overallStats = useMemo(() => ({
    totalPapers: progressData.length,
    totalAttempts: progressData.reduce((sum, paper) => sum + paper.summary.total_attempts, 0),
  }), [progressData]);

  // Handlers
  const handleCardClick = useCallback(() => {
    if (progressData.length > 0) {
      setIsDialogOpen(true);
    }
  }, [progressData.length]);

  const handleLoadMore = useCallback(() => {
    setVisiblePapers(prev => Math.min(prev + 3, progressData.length));
  }, [progressData.length]);

  const handleShowLess = useCallback(() => {
    setVisiblePapers(INITIAL_PAPERS_TO_SHOW);
  }, []);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Loading your progress...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

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
    <>
      <Card 
        className="shadow-card cursor-pointer hover:shadow-elegant transition-all"
        onClick={handleCardClick}
      >
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Track your improvement across attempts (Click to view details)</CardDescription>
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
                formatter={(value: number, name: string) => {
                  if (name === 'score') return [`${value}%`, 'Score'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${label} - ${data.date}`;
                  }
                  return label;
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

      {/* Detailed Summary Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Performance Summary</DialogTitle>
            <DialogDescription>
              Detailed analysis of your performance across all papers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Overall Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Overall Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Papers</p>
                  <p className="text-2xl font-bold">{overallStats.totalPapers}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
                  <p className="text-2xl font-bold">{overallStats.totalAttempts}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Paper-by-Paper Breakdown - Lazy loaded */}
            {progressData.slice(0, visiblePapers).map((paper, index) => (
              <div key={paper.paper_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Paper {index + 1}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {paper.paper_id.slice(0, 20)}...
                  </Badge>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground mb-1">Total Attempts</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {paper.summary.total_attempts}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-muted-foreground mb-1">Best Score</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {paper.summary.best_score}%
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-muted-foreground mb-1">Average</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {paper.summary.average_score.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-muted-foreground mb-1">Latest</p>
                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {paper.summary.latest_score}%
                    </p>
                  </div>
                </div>

                {/* Improvement Rate */}
                <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                  {paper.summary.improvement_rate >= 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        Improvement Rate: 
                        <span className="text-green-600 ml-2 font-bold">
                          +{paper.summary.improvement_rate}%
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">
                        Change: 
                        <span className="text-red-600 ml-2 font-bold">
                          {paper.summary.improvement_rate}%
                        </span>
                      </span>
                    </>
                  )}
                </div>

                {/* Attempt History */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Attempt History
                  </h4>
                  <div className="space-y-2">
                    {paper.data_points.map((point) => (
                      <div
                        key={`${paper.paper_id}-${point.attempt_number}`}
                        className="flex items-center justify-between p-2 bg-secondary/20 rounded-md text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            #{point.attempt_number}
                          </Badge>
                          <span className="text-muted-foreground">{point.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 inline mr-1" />
                            {point.correct_answers}/{point.total_answered}
                          </span>
                          <span className={`font-bold ${
                            point.percentage >= 70 ? 'text-green-600' :
                            point.percentage >= 50 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {point.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {index < visiblePapers - 1 && <Separator />}
              </div>
            ))}

            {/* Load More / Show Less Buttons */}
            {progressData.length > INITIAL_PAPERS_TO_SHOW && (
              <div className="flex justify-center gap-3 pt-4">
                {visiblePapers < progressData.length && (
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    className="w-full max-w-xs"
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More ({progressData.length - visiblePapers} remaining)
                  </Button>
                )}
                {visiblePapers > INITIAL_PAPERS_TO_SHOW && (
                  <Button
                    variant="ghost"
                    onClick={handleShowLess}
                    className="w-full max-w-xs"
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
