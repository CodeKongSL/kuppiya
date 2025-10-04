import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPapersBySubject } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";

export const PapersList = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  
  if (!subject) {
    navigate('/subjects');
    return null;
  }

  const papers = getPapersBySubject(subject);

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
          <h1 className="text-4xl font-bold mb-2">{subject} Exam Papers</h1>
          <p className="text-muted-foreground text-lg">
            Choose from {papers.length} years of past examination papers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </div>
    </div>
  );
};
