import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Award, Clock, Target, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAttemptHistory, calculateGrade } from "@/data/examData";
import { getPaperResultSummary } from "@/services/apiClient";

export const Results = () => {
  const { attemptId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paperAnswersId = searchParams.get('paperAnswersId');
  
  // State for API results
  const [apiSummary, setApiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Local attempts
  const attempts = getAttemptHistory();
  const attempt = attempts.find(a => a.id === attemptId);

  // Fetch API results if paperAnswersId is present
  useEffect(() => {
    const fetchApiResults = async () => {
      if (paperAnswersId) {
        setLoading(true);
        try {
          const summaryResponse = await getPaperResultSummary();
          // Find the summary matching this paper_answers_id
          const matchingSummary = summaryResponse?.data?.find(
            (s: any) => s.paper_answers_id === paperAnswersId
          );
          if (matchingSummary) {
            setApiSummary(matchingSummary);
          }
        } catch (error) {
          console.error('Error fetching results:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchApiResults();
  }, [paperAnswersId]);

  // Show loading state for API results
  if (paperAnswersId && loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Use API summary if available, otherwise use local attempt
  const isApiResult = !!apiSummary;
  const totalQuestions = isApiResult ? apiSummary.total_questions : attempt?.totalQuestions || 0;
  const correctCount = isApiResult ? apiSummary.correct_answers : attempt?.score || 0;
  const wrongCount = totalQuestions - correctCount;
  const percentage = isApiResult ? apiSummary.percentage : attempt?.percentage || 0;
  const totalAnswered = isApiResult ? apiSummary.total_answered : totalQuestions;

  if (!attempt && !apiSummary) {
    navigate('/');
    return null;
  }

  const grade = calculateGrade(percentage);
  const minutes = attempt ? Math.floor(attempt.timeTaken / 60) : 0;
  const seconds = attempt ? attempt.timeTaken % 60 : 0;

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
      title: "Answered",
      value: `${totalAnswered}/${totalQuestions}`,
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Accuracy",
      value: `${percentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  // Add time stat only for local attempts
  if (attempt && !isApiResult) {
    stats.splice(2, 0, {
      title: "Time Taken",
      value: `${minutes}m ${seconds}s`,
      icon: Clock,
      color: "text-primary",
    });
  }

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
              {isApiResult 
                ? `Paper ID: ${apiSummary.paper_id}` 
                : `Examination Paper ${attempt?.paperYear}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                {percentage.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                You scored {correctCount} out of {totalQuestions} questions
              </p>
              {isApiResult && totalAnswered < totalQuestions && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  ({totalQuestions - totalAnswered} questions were not attempted)
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score Progress</span>
                <span className="font-semibold">{correctCount}/{totalQuestions}</span>
              </div>
              <Progress value={percentage} className="h-3" />
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
              {percentage >= 90 && "Excellent work! You have mastered this material."}
              {percentage >= 70 && percentage < 90 && "Great job! You're doing very well. A bit more practice will help you achieve excellence."}
              {percentage >= 50 && percentage < 70 && "Good effort! Keep practicing to improve your understanding of the topics."}
              {percentage < 50 && "Keep going! Review the explanations and try again to improve your score."}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {!isApiResult && (
            <Button 
              onClick={() => navigate(`/review/${attempt?.id}`)}
              className="flex-1 bg-gradient-primary"
              size="lg"
            >
              Review Answers
            </Button>
          )}
          <Button 
            onClick={() => navigate('/subjects')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Try Another Subject
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
