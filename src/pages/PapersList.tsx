import { examPapers } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";

export const PapersList = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Exam Papers</h1>
          <p className="text-muted-foreground text-lg">
            Choose from {examPapers.length} years of past examination papers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </div>
    </div>
  );
};
