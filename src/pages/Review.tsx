import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAttemptHistory, examPapers } from "@/data/examData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const Review = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const attempts = getAttemptHistory();
  const attempt = attempts.find(a => a.id === attemptId);
  const paper = examPapers.find(p => p.id === attempt?.paperId);
  
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  if (!attempt || !paper) {
    navigate('/');
    return null;
  }

  const toggleQuestion = (questionId: number) => {
    setOpenQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(`/results/${attemptId}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <h1 className="text-4xl font-bold mb-2">Answer Review</h1>
          <p className="text-muted-foreground text-lg">
            {paper.title} • Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage.toFixed(1)}%)
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-6 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-success">{attempt.score}</span>
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">
                    {attempt.totalQuestions - attempt.score}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-4">
          {paper.questions.map((question, idx) => {
            const userAnswer = attempt.answers[idx];
            const isCorrect = userAnswer === question.correctAnswer;
            const isOpen = openQuestions.includes(question.id);

            return (
              <Card
                key={question.id}
                className={`shadow-card transition-all ${
                  isCorrect ? 'border-l-4 border-l-success' : 'border-l-4 border-l-destructive'
                }`}
              >
                <Collapsible open={isOpen} onOpenChange={() => toggleQuestion(question.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={isCorrect ? "default" : "destructive"}>
                            Question {question.id}
                          </Badge>
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <CardTitle className="text-base font-normal">
                          {question.question}
                        </CardTitle>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {/* Options */}
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => {
                          const isUserAnswer = userAnswer === optIdx;
                          const isCorrectAnswer = question.correctAnswer === optIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? 'border-success bg-success/10'
                                  : isUserAnswer
                                  ? 'border-destructive bg-destructive/10'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                )}
                                <span className="flex-1">{option}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <span>Explanation</span>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/papers')}
            className="flex-1 bg-gradient-primary"
            size="lg"
          >
            Practice Another Paper
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
