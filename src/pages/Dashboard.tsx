import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BookOpen, TrendingUp, Target, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PerformanceChart } from "@/components/PerformanceChart";
import { examPapers } from "@/data/examData";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [progressStats, setProgressStats] = useState({
    totalAttempts: 0,
    avgScore: 0,
    bestScore: 0,
    loading: true,
  });

  const handleProgressDataLoaded = (stats: {
    totalAttempts: number;
    avgScore: number;
    bestScore: number;
  }) => {
    setProgressStats({
      ...stats,
      loading: false,
    });
  };

  const stats = [
    {
      title: "Total Papers",
      value: examPapers.length,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Attempts Made",
      value: progressStats.loading ? "..." : progressStats.totalAttempts,
      icon: Target,
      color: "text-accent",
    },
    {
      title: "Average Score",
      value: progressStats.loading 
        ? "..." 
        : progressStats.avgScore > 0 
        ? `${progressStats.avgScore.toFixed(1)}%` 
        : "N/A",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Best Score",
      value: progressStats.loading 
        ? "..." 
        : progressStats.bestScore > 0 
        ? `${progressStats.bestScore.toFixed(1)}%` 
        : "N/A",
      icon: Award,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-primary text-primary-foreground rounded-2xl p-8 md:p-12 shadow-elegant">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to ExamPrep Pro
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl">
            Master your exams with 10 years of past papers. Practice, learn, and track your progress.
          </p>
          <Button 
            onClick={() => navigate('/subjects')}
            size="lg"
            variant="secondary"
            className="shadow-lg hover:shadow-xl transition-all"
          >
            Choose Subject
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-card hover:shadow-elegant transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Chart */}
        <PerformanceChart onDataLoaded={handleProgressDataLoaded} />

        {/* Recent Papers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Jump into the most recent exam papers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {examPapers.slice(0, 3).map((paper) => (
                <div
                  key={paper.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <h3 className="font-semibold">{paper.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {paper.questions.length} questions • {paper.duration} minutes
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/quiz/${paper.id}`)}
                    variant="outline"
                  >
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
