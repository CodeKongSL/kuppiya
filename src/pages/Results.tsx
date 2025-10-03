import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Award, Clock, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAttemptHistory, calculateGrade } from "@/data/examData";

export const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const attempts = getAttemptHistory();
  const attempt = attempts.find(a => a.id === attemptId);

  if (!attempt) {
    navigate('/');
    return null;
  }

  const grade = calculateGrade(attempt.percentage);
  const correctCount = attempt.score;
  const wrongCount = attempt.totalQuestions - attempt.score;
  const minutes = Math.floor(attempt.timeTaken / 60);
  const seconds = attempt.timeTaken % 60;

  const stats = [
    {
      title: "Correct Answers",
      value: correctCount,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Wrong Answers",
      value: wrongCount,
      icon: XCircle,
      color: "text-destructive",
    },
    {
      title: "Time Taken",
      value: `${minutes}m ${seconds}s`,
      icon: Clock,
      color: "text-primary",
    },
    {
      title: "Accuracy",
      value: `${attempt.percentage.toFixed(1)}%`,
      icon: Target,
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Results Header */}
        <Card className="shadow-elegant bg-gradient-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Award className="h-24 w-24 text-accent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-accent-foreground">
                    {grade}
                  </span>
                </div>
              </div>
            </div>
            <CardTitle className="text-4xl">Quiz Completed!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Examination Paper {attempt.paperYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {attempt.percentage.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                You scored {correctCount} out of {attempt.totalQuestions} questions
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score Progress</span>
                <span className="font-semibold">{correctCount}/{attempt.totalQuestions}</span>
              </div>
              <Progress value={attempt.percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-card">
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

        {/* Performance Insight */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {attempt.percentage >= 90 && "Excellent work! You have mastered this material."}
              {attempt.percentage >= 70 && attempt.percentage < 90 && "Great job! You're doing very well. A bit more practice will help you achieve excellence."}
              {attempt.percentage >= 50 && attempt.percentage < 70 && "Good effort! Keep practicing to improve your understanding of the topics."}
              {attempt.percentage < 50 && "Keep going! Review the explanations and try again to improve your score."}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate(`/review/${attempt.id}`)}
            className="flex-1 bg-gradient-primary"
            size="lg"
          >
            Review Answers
          </Button>
          <Button 
            onClick={() => navigate('/papers')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Try Another Paper
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
