import { Calendar, Clock, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamPaper, getAttemptsByPaper } from "@/data/examData";
import { useNavigate } from "react-router-dom";

interface PaperCardProps {
  paper: ExamPaper;
}

export const PaperCard = ({ paper }: PaperCardProps) => {
  const navigate = useNavigate();
  const attempts = getAttemptsByPaper(paper.id);
  const lastAttempt = attempts[attempts.length - 1];

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{paper.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              Year {paper.year}
            </CardDescription>
          </div>
          {attempts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{paper.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{paper.duration} mins</span>
          </div>
        </div>

        {lastAttempt && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Score:</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-semibold text-foreground">
                  {lastAttempt.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate(`/quiz/${paper.id}`)}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {attempts.length > 0 ? 'Practice Again' : 'Start Practice'}
        </Button>
      </CardContent>
    </Card>
  );
};
