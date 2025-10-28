import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { examPapers, saveAttempt, AttemptHistory } from "@/data/examData";
import { toast } from "sonner";
import { bioService } from "@/bio/services/bioService";
import { BioQuestion } from "@/bio/models/BioQuestion";
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

  // Determine if this is a Biology paper
  const isBioPaper = paperId?.startsWith('PAPER-') || false;

  // For non-Bio papers, find the paper in local data
  const paper = !isBioPaper ? examPapers.find(p => p.id === paperId) : undefined;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(50).fill(-1));
  const [timeLeft, setTimeLeft] = useState(paper ? paper.duration * 60 : 3600);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [startTime] = useState(Date.now());

  // Biology-specific states
  const [bioQuestion, setBioQuestion] = useState<BioQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(50);

  useEffect(() => {
    if (!isBioPaper && !paper) {
      navigate('/papers');
      return;
    }

    if (isBioPaper && paperId) {
      loadBioQuestion(1); // Load first question
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
  }, [paperId, navigate]);

  const loadBioQuestion = async (questionNumber: number) => {
    if (!paperId) return;
    
    setLoadingQuestion(true);
    try {
      const question = await bioService.getQuestionByNumber(paperId, questionNumber);
      setBioQuestion(question);
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    if (isBioPaper && paperId) {
      loadBioQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, isBioPaper, paperId]);

  if (!paper && !isBioPaper) return null;

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
    const maxQuestions = isBioPaper ? totalQuestions : (paper?.questions.length || 50);
    if (currentQuestion < maxQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = () => {
    if (isBioPaper) {
      // For now, just navigate back. You can implement bio-specific result handling later
      toast.success("Quiz submitted successfully!");
      navigate('/subjects');
      return;
    }

    if (!paper) return;

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

  const maxQuestions = isBioPaper ? totalQuestions : (paper?.questions.length || 50);
  const answeredCount = answers.filter(a => a !== -1).length;
  const progress = (answeredCount / maxQuestions) * 100;

  // Render bio question
  if (isBioPaper && bioQuestion) {
    const options = [
      bioQuestion.option_a,
      bioQuestion.option_b,
      bioQuestion.option_c,
      bioQuestion.option_d,
      bioQuestion.option_e,
    ].filter(Boolean); // Remove undefined/empty if any

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Header */}
          <Card className="mb-4 shadow-card">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Biology Examination {new Date().getFullYear()}</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </p>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 md:h-5 md:w-5 ${timeLeft < 300 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className={`text-base md:text-lg font-mono font-semibold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Answered: {answeredCount}/{totalQuestions}
                  </div>
                </div>
              </div>
              <Progress value={progress} className="mt-3" />
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 lg:items-start">
            {/* Question Section */}
            <Card className="shadow-elegant lg:h-[calc(100vh-240px)] lg:flex lg:flex-col">
              <CardHeader className="pb-2 lg:flex-shrink-0">
                <CardTitle className="text-base md:text-lg">
                  Question {bioQuestion.question_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:flex-1 lg:flex lg:flex-col lg:overflow-y-auto">
                {loadingQuestion ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {bioQuestion.question_text.includes('\n') ? (
                      <div className="text-base md:text-lg leading-relaxed">
                        {/* Add extra space before the first line */}
                        <div style={{ height: '1.2em' }} />
                        {bioQuestion.question_text.split('\n').map((line, idx) => (
                          <div key={idx} style={{ marginBottom: '1.2em' }}>{line}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base md:text-lg leading-relaxed">{bioQuestion.question_text}</p>
                    )}

                    <RadioGroup
                      value={answers[currentQuestion]?.toString()}
                      onValueChange={handleAnswerChange}
                      className="space-y-2 pt-1"
                    >
                      {options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                            answers[currentQuestion] === idx
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                          }`}
                        >
                          <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer text-sm md:text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 lg:mt-auto lg:flex-shrink-0">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion === totalQuestions - 1 ? (
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

                {/* Mobile Quick Navigation */}
                <div className="lg:hidden pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Quick Navigation:</p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: totalQuestions }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuestionJump(idx)}
                        className={`aspect-square rounded-md text-xs font-medium transition-all ${
                          idx === currentQuestion
                            ? 'bg-primary text-primary-foreground scale-105 shadow-md'
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

            {/* Desktop Quick Navigation Sidebar */}
            <div className="hidden lg:block">
              <Card className="shadow-elegant sticky top-4 lg:h-[calc(100vh-240px)] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Quick Navigation</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {answeredCount} of {totalQuestions} answered
                      </p>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-primary"></div>
                        <span className="text-muted-foreground">Current</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-green-500/15 border border-green-500/40"></div>
                        <span className="text-muted-foreground">Answered</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-muted"></div>
                        <span className="text-muted-foreground">Unanswered</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: totalQuestions }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuestionJump(idx)}
                        className={`w-11 h-11 rounded text-xs font-medium transition-all ${
                          idx === currentQuestion
                            ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 ring-offset-1'
                            : answers[idx] !== -1
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/40 hover:bg-green-500/20'
                            : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Dialog */}
          <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Submit Quiz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {answeredCount} out of {totalQuestions} questions.
                  {answeredCount < totalQuestions && (
                    <span className="block mt-2 text-destructive">
                      Warning: {totalQuestions - answeredCount} questions are unanswered!
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
  }

  // Render regular paper question (Chemistry/Physics)
  if (!paper) return null;
  const question = paper.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Header */}
        <Card className="mb-4 shadow-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold">{paper.title}</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {paper.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 md:h-5 md:w-5 ${timeLeft < 300 ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className={`text-base md:text-lg font-mono font-semibold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Answered: {answeredCount}/{paper.questions.length}
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-3" />
          </CardContent>
        </Card>

        {/* Main Content - Two Column Layout on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 lg:items-start">
          {/* Question Section */}
          <Card className="shadow-elegant lg:h-[calc(100vh-240px)] lg:flex lg:flex-col">
            <CardHeader className="pb-2 lg:flex-shrink-0">
              <CardTitle className="text-base md:text-lg">
                Question {question.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:flex-1 lg:flex lg:flex-col lg:overflow-y-auto">
              <p className="text-base md:text-lg leading-relaxed">{question.question}</p>

              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={handleAnswerChange}
                className="space-y-2 pt-1"
              >
                {question.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === idx
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-sm md:text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 lg:mt-auto lg:flex-shrink-0">
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

              {/* Mobile Quick Navigation */}
              <div className="lg:hidden pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">Quick Navigation:</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {paper.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`aspect-square rounded-md text-xs font-medium transition-all ${
                        idx === currentQuestion
                          ? 'bg-primary text-primary-foreground scale-105 shadow-md'
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

          {/* Desktop Quick Navigation Sidebar */}
          <div className="hidden lg:block">
            <Card className="shadow-elegant sticky top-4 lg:h-[calc(100vh-240px)] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Quick Navigation</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {answeredCount} of {paper.questions.length} answered
                    </p>
                  </div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-primary"></div>
                      <span className="text-muted-foreground">Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-green-500/15 border border-green-500/40"></div>
                      <span className="text-muted-foreground">Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-muted"></div>
                      <span className="text-muted-foreground">Unanswered</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-5 gap-1.5">
                  {paper.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-11 h-11 rounded text-xs font-medium transition-all ${
                        idx === currentQuestion
                          ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 ring-offset-1'
                          : answers[idx] !== -1
                          ? 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/40 hover:bg-green-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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