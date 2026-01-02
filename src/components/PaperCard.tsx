import React from "react";
import { Calendar, Clock, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamPaper, getAttemptsByPaper } from "@/data/examData";
import { useNavigate } from "react-router-dom";
import { startPaper } from "@/services/apiClient";

interface PaperCardProps {
  paper: ExamPaper;
  lazyLoad?: boolean; // Enable lazy loading (fetch on button click)
}

export const PaperCard = ({ paper, lazyLoad = false }: PaperCardProps) => {
  const navigate = useNavigate();
  const attempts = getAttemptsByPaper(paper.id);
  const lastAttempt = attempts[attempts.length - 1];
  const [isLoading, setIsLoading] = React.useState(false);


  // Check if this is an API paper (Biology, Chemistry, or Physics lazy-loaded)
  // Bio papers use "BIO-" prefix, Chemistry uses "CHEMISTRY-" prefix, Physics uses "PHYSICS-" prefix
  const isApiPaper = lazyLoad || (paper.id && (paper.id.startsWith('BIO-') || paper.id.startsWith('CHEMISTRY-') || paper.id.startsWith('PHYSICS-')));

  const handleStartPractice = async () => {
    // For lazy loaded Bio papers, fetch the paper first
    if (lazyLoad && paper.subject === 'Bio') {
      setIsLoading(true);
      try {
        const { bioService } = await import('@/bio/services/bioService');
        const fetchedPaper = await bioService.getPaperByYear('Biology', paper.year.toString());
        
        const quizId = fetchedPaper.paper_id || fetchedPaper._id || '';
        
        // Call startPaper API before navigating
        const startResponse = await startPaper(quizId);
        const startedAt = startResponse?.data?.started_at || new Date().toISOString();
        
        navigate(`/quiz/${quizId}?subject=Bio`, { state: { startedAt } });
      } catch (error) {
        console.error('Error loading paper:', error);
        alert('Failed to load paper. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    // For lazy loaded Chemistry papers, fetch the paper first
    if (lazyLoad && paper.subject === 'Chemistry') {
      setIsLoading(true);
      try {
        const { chemistryService } = await import('@/chemistry/services/chemistryService');
        const fetchedPaper = await chemistryService.getPaperByYear('Chemistry', paper.year.toString());
        
        const quizId = fetchedPaper.paper_id || fetchedPaper._id || '';
        
        // Call startPaper API before navigating
        const startResponse = await startPaper(quizId);
        const startedAt = startResponse?.data?.started_at || new Date().toISOString();
        
        navigate(`/quiz/${quizId}?subject=Chemistry`, { state: { startedAt } });
      } catch (error) {
        console.error('Error loading paper:', error);
        alert('Failed to load paper. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    // For lazy loaded Physics papers, fetch the paper first
    if (lazyLoad && paper.subject === 'Physics') {
      setIsLoading(true);
      try {
        const { physicsService } = await import('@/physics/services/physicsService');
        // Use lowercase subject name as required by API
        const fetchedPaper = await physicsService.getPaperByYear('physics', paper.year.toString());
        
        // Navigate with the fetched paper ID
        const quizId = fetchedPaper.paper_id || fetchedPaper._id;
        
        // Call startPaper API before navigating
        const startResponse = await startPaper(quizId);
        const startedAt = startResponse?.data?.started_at || new Date().toISOString();
        
        navigate(`/quiz/${quizId}?subject=Physics`, { state: { startedAt } });
      } catch (error) {
        console.error('Error loading paper:', error);
        alert('Failed to load paper. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    // For API papers, use paper.paper_id if available, otherwise use paper.id
    const quizId = (paper as any).paper_id || paper.id;
    
    // Add subject to the quiz URL for better detection
    if (paper.subject) {
      navigate(`/quiz/${quizId}?subject=${paper.subject}`);
    } else {
      navigate(`/quiz/${quizId}`);
    }
  };

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
            <span>
              {isApiPaper 
                ? '50 Questions' 
                : `${paper.questions.length} Questions`}
            </span>
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
          onClick={handleStartPractice}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (attempts.length > 0 ? 'Practice Again' : 'Start Practice')}
        </Button>
      </CardContent>
    </Card>
  );
};