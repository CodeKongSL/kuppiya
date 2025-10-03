import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { examPapers, saveAttempt, AttemptHistory } from "@/data/examData";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Quiz = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const paper = examPapers.find(p => p.id === paperId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(50).fill(-1));
  const [timeLeft, setTimeLeft] = useState(paper ? paper.duration * 60 : 3600);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!paper) {
      navigate('/papers');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paper, navigate]);

  if (!paper) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < paper.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let correctCount = 0;

    paper.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / paper.questions.length) * 100;

    const attempt: AttemptHistory = {
      id: Date.now().toString(),
      paperId: paper.id,
      paperYear: paper.year,
      date: new Date().toISOString(),
      score: correctCount,
      totalQuestions: paper.questions.length,
      percentage,
      timeTaken,
      answers,
    };

    saveAttempt(attempt);
    toast.success("Quiz submitted successfully!");
    navigate(`/results/${attempt.id}`);
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const progress = (answeredCount / paper.questions.length) * 100;
  const question = paper.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{paper.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {paper.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${timeLeft < 300 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className={`text-lg font-mono font-semibold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Answered: {answeredCount}/{paper.questions.length}
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">
              Question {question.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{question.question}</p>

            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
              
              {currentQuestion === paper.questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="flex-1 bg-gradient-primary"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1"
                >
                  Next Question
                </Button>
              )}
            </div>

            {/* Question Navigation Grid */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Quick Navigation:</p>
              <div className="grid grid-cols-10 gap-2">
                {paper.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`aspect-square rounded-md text-sm font-medium transition-all ${
                      idx === currentQuestion
                        ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                        : answers[idx] !== -1
                        ? 'bg-success/20 text-success border-2 border-success'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Submit Quiz?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have answered {answeredCount} out of {paper.questions.length} questions.
                {answeredCount < paper.questions.length && (
                  <span className="block mt-2 text-destructive">
                    Warning: {paper.questions.length - answeredCount} questions are unanswered!
                  </span>
                )}
                <span className="block mt-2">
                  Are you sure you want to submit your quiz?
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                Submit Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
