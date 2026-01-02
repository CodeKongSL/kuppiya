import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getPapersBySubject } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";

// Static metadata for Bio papers (for lazy loading)
const BIO_PAPERS_METADATA = [
  { year: 2023, questionCount: 50, duration: 120 },
  { year: 2022, questionCount: 50, duration: 120 },
  { year: 2021, questionCount: 50, duration: 120 },
  { year: 2020, questionCount: 50, duration: 120 },
  { year: 2019, questionCount: 50, duration: 120 },
];

// Static metadata for Chemistry papers (for lazy loading)
const CHEMISTRY_PAPERS_METADATA = [
  { year: 2023, questionCount: 50, duration: 120 },
  { year: 2022, questionCount: 50, duration: 120 },
  { year: 2021, questionCount: 50, duration: 120 },
  { year: 2020, questionCount: 50, duration: 120 },
  { year: 2019, questionCount: 50, duration: 120 },
];

// Static metadata for Physics papers (for lazy loading)
const PHYSICS_PAPERS_METADATA = [
  { year: 2023, questionCount: 50, duration: 120 },
  { year: 2022, questionCount: 50, duration: 120 },
  { year: 2021, questionCount: 50, duration: 120 },
  { year: 2020, questionCount: 50, duration: 120 },
  { year: 2019, questionCount: 50, duration: 120 },
];

export const PapersList = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  // All subjects (Bio, Chemistry, Physics) now use lazy loading
  // Papers are loaded only when user clicks "Start Practice"





  if (!subject) {
    navigate('/subjects');
    return null;
  }

  // All subjects with API support now use lazy loading (Bio, Chemistry, Physics)
  const papers = getPapersBySubject(subject);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/subjects')}
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>


        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {subject === 'Bio' ? 'Biology' : subject} Exam Papers
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-lg">
              Choose from {subject === 'Bio' ? BIO_PAPERS_METADATA.length : subject === 'Chemistry' ? CHEMISTRY_PAPERS_METADATA.length : subject === 'Physics' ? PHYSICS_PAPERS_METADATA.length : papers.length} years of past examination papers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subject === 'Bio' ? (
              BIO_PAPERS_METADATA.map((metadata, index) => (
                <PaperCard 
                  key={`bio-paper-${metadata.year}`}
                  paper={{
                    id: `BIO-${metadata.year}`,
                    year: metadata.year,
                    subject: 'Bio',
                    title: `Biology Examination ${metadata.year}`,
                    questions: [],
                    duration: metadata.duration,
                  }}
                  lazyLoad={true}
                />
              ))
            ) : subject === 'Chemistry' ? (
              CHEMISTRY_PAPERS_METADATA.map((metadata, index) => (
                <PaperCard 
                  key={`chemistry-paper-${metadata.year}`}
                  paper={{
                    id: `CHEMISTRY-${metadata.year}`,
                    year: metadata.year,
                    subject: 'Chemistry',
                    title: `Chemistry Examination ${metadata.year}`,
                    questions: [],
                    duration: metadata.duration,
                  }}
                  lazyLoad={true}
                />
              ))
            ) : subject === 'Physics' ? (
              PHYSICS_PAPERS_METADATA.map((metadata, index) => (
                <PaperCard 
                  key={`physics-paper-${metadata.year}`}
                  paper={{
                    id: `PHYSICS-${metadata.year}`,
                    year: metadata.year,
                    subject: 'Physics',
                    title: `Physics Examination ${metadata.year}`,
                    questions: [],
                    duration: metadata.duration,
                  }}
                  lazyLoad={true}
                />
              ))
            ) : (
              papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))
            )}
        </div>
      </div>
    </div>
  );
};