import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPapersBySubject } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { bioService } from "@/bio/services/bioService";
import { BioPaper } from "@/bio/models/BioPaper";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PapersList = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [bioPapers, setBioPapers] = useState<BioPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subject === 'Bio') {
      fetchBiologyPapers();
    }
  }, [subject]);

  const fetchBiologyPapers = async () => {
    setLoading(true);
    setError(null);
    try {
      const papers = await bioService.getAllBiologyPapers();
      setBioPapers(papers);
    } catch (err) {
      setError('Failed to load biology papers. Please try again later.');
      console.error('Error loading biology papers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!subject) {
    navigate('/subjects');
    return null;
  }

  // For Biology, use API data. For other subjects, use local data
  const papers = subject === 'Bio' ? bioPapers : getPapersBySubject(subject);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/subjects')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subjects
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {subject === 'Bio' ? 'Biology' : subject} Exam Papers
          </h1>
          <p className="text-muted-foreground text-lg">
            {loading 
              ? 'Loading papers...' 
              : `Choose from ${papers.length} years of past examination papers`}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject === 'Bio' ? (
              bioPapers.map((paper, index) => (
                <PaperCard 
                  key={paper.paper_id || `bio-paper-${index}`}
                  paper={{
                    id: paper.paper_id || `PAPER-${paper.year}-${index}`,
                    year: paper.year,
                    subject: 'Bio',
                    title: paper.title || `Bio Examination ${paper.year}`,
                    questions: [],
                    duration: paper.duration || 60,
                  }} 
                />
              ))
            ) : (
              papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};