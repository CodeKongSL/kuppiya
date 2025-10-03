import { Calendar, Clock, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAttemptHistory, calculateGrade } from "@/data/examData";
import { PerformanceChart } from "@/components/PerformanceChart";
import { useNavigate } from "react-router-dom";

export const History = () => {
  const navigate = useNavigate();
  const attempts = getAttemptHistory().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (attempts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Practice History</h1>
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No attempts yet</h2>
              <p className="text-muted-foreground mb-6">
                Start practicing to see your progress here
              </p>
              <Button onClick={() => navigate('/papers')} className="bg-gradient-primary">
                Browse Exam Papers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const avgScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
  const bestScore = Math.max(...attempts.map(a => a.percentage));
  const totalTime = attempts.reduce((sum, a) => sum + a.timeTaken, 0);
  const avgTime = totalTime / attempts.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Practice History</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and review past attempts
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgScore.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Award className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bestScore.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.floor(avgTime / 60)}m
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <PerformanceChart attempts={attempts} />

        {/* Attempt History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Attempts</CardTitle>
            <CardDescription>Complete history of your practice sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt) => {
                const grade = calculateGrade(attempt.percentage);
                const date = new Date(attempt.date);
                
                return (
                  <div
                    key={attempt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gradient-card border border-border hover:shadow-elegant transition-all"
                  >
                    <div className="flex-1 space-y-2 mb-4 md:mb-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">Paper {attempt.paperYear}</h3>
                        <Badge 
                          variant={attempt.percentage >= 70 ? "default" : "secondary"}
                          className={attempt.percentage >= 70 ? "bg-success" : ""}
                        >
                          Grade: {grade}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {attempt.score}/{attempt.totalQuestions} correct
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          {attempt.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => navigate(`/results/${attempt.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Results
                        </Button>
                        <Button
                          onClick={() => navigate(`/review/${attempt.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
