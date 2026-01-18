import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, TrendingUp, TrendingDown, Target, Award, Calendar, CheckCircle2, ChevronDown, ChevronUp, CalendarIcon, X, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Fetch data whenever date filters change
  useEffect(() => {
    fetchProgressData();
  }, [startDate, endDate]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      // Build query parameters - only include dates if they are set
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('start_date', format(startDate, 'yyyy-MM-dd'));
      }
      
      if (endDate) {
        params.append('end_date', format(endDate, 'yyyy-MM-dd'));
      }
      
      // Build URL with or without parameters
      const url = params.toString() 
        ? `https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Generate/Progress/Chart?${params}`
        : 'https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Generate/Progress/Chart';
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  const handleClearFilters = useCallback(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, []);

  // Check if filters are active
  const hasActiveFilters = startDate !== undefined || endDate !== undefined;

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Your progress will appear here after completing exams</CardDescription>
            </div>
          </div>

          {/* Show Date Filter Bar even when no data */}
          <div className="flex flex-wrap items-center gap-3 mt-4 p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>

            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => endDate ? date > endDate : date > new Date()}
                />
              </PopoverContent>
            </Popover>

            {/* End Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : date > new Date()}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
            )}

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="secondary" className="text-xs">
                  {startDate && endDate 
                    ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`
                    : startDate 
                    ? `From ${format(startDate, "MMM dd, yyyy")}`
                    : `Until ${format(endDate!, "MMM dd, yyyy")}`
                  }
                </Badge>
              </div>
            )}

            {!hasActiveFilters && (
              <Badge variant="outline" className="text-xs ml-auto">
                Showing All Progress
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="mb-3">No attempts yet. Start practicing!</p>
          {hasActiveFilters && (
            <p className="text-xs text-center max-w-md">
              No progress found for the selected date range. Try adjusting your filters or clear them to see all attempts.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Track your improvement across attempts</CardDescription>
            </div>
          </div>

          {/* Date Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4 p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>

            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => endDate ? date > endDate : date > new Date()}
                />
              </PopoverContent>
            </Popover>

            {/* End Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : date > new Date()}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
            )}

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="secondary" className="text-xs">
                  {startDate && endDate 
                    ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`
                    : startDate 
                    ? `From ${format(startDate, "MMM dd, yyyy")}`
                    : `Until ${format(endDate!, "MMM dd, yyyy")}`
                  }
                </Badge>
              </div>
            )}

            {!hasActiveFilters && (
              <Badge variant="outline" className="text-xs ml-auto">
                Showing All Progress
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent 
          className="cursor-pointer hover:bg-secondary/20 transition-colors rounded-lg p-4"
          onClick={handleCardClick}
        >
          <div className="mb-2 text-xs text-muted-foreground text-center">
            Click chart to view detailed summary
          </div>
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
