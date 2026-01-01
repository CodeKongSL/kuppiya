import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, Clock } from "lucide-react";
import { getPapersBySubject } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { chemistryService } from "@/chemistry/services/chemistryService";
import { ChemistryPaper } from "@/chemistry/models/ChemistryPaper";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Static metadata for Bio papers (for lazy loading)
const BIO_PAPERS_METADATA = [
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
  const [chemistryPapers, setChemistryPapers] = useState<ChemistryPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<string | null>(null);

  useEffect(() => {
    if (subject === 'Chemistry') {
      fetchChemistryPapers();
    }
    // Bio and Physics papers are loaded lazily when user clicks "Start Practice"
  }, [subject]);



  const fetchChemistryPapers = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get cache status before fetching
      const cacheStatus = chemistryService.getCacheStatus();
      
      if (cacheStatus.isCached && !forceRefresh) {
        const expiresInMinutes = Math.round(cacheStatus.expiresIn! / 60000);
        setCacheInfo(`Using cached data (${cacheStatus.paperCount} papers, expires in ${expiresInMinutes}m)`);
      } else {
        setCacheInfo(null);
      }

      const papers = await chemistryService.getAllChemistryPapers(forceRefresh);
      setChemistryPapers(papers);
      
      if (forceRefresh) {
        setCacheInfo(`Refreshed! Loaded ${papers.length} papers`);
        setTimeout(() => setCacheInfo(null), 3000);
      }
    } catch (err) {
      setError('Failed to load chemistry papers. Please try again later.');
      console.error('Error loading chemistry papers:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (subject === 'Chemistry') {
      await fetchChemistryPapers(true);
    }
    // Bio and Physics papers use lazy loading, no refresh needed
    setIsRefreshing(false);
  };

  const handleClearCache = () => {
    if (subject === 'Chemistry') {
      chemistryService.clearCache();
      setCacheInfo('Cache cleared');
      fetchChemistryPapers(true);
    }
    // Bio and Physics papers use lazy loading, no cache to clear
  };

  if (!subject) {
    navigate('/subjects');
    return null;
  }

  // For Chemistry, use API data. For other subjects, use local data
  const papers = subject === 'Chemistry' 
      ? chemistryPapers 
      : getPapersBySubject(subject);

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

          {subject === 'Chemistry' && !loading && (
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                onClick={handleClearCache}
                variant="ghost"
                size="sm"
              >
                Clear Cache
              </Button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {subject === 'Bio' ? 'Biology' : subject} Exam Papers
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-lg">
              {loading 
                ? 'Loading papers...' 
                : `Choose from ${subject === 'Bio' ? BIO_PAPERS_METADATA.length : subject === 'Physics' ? PHYSICS_PAPERS_METADATA.length : papers.length} years of past examination papers`}
            </p>
            {subject === 'Chemistry' && cacheInfo && !loading && (
              <span className="text-sm text-muted-foreground/70 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {cacheInfo}
              </span>
            )}
          </div>
        </div>



        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              {(subject === 'Chemistry' && chemistryPapers.length > 0) && (
                <span className="block mt-2 text-sm">
                  Showing cached papers from previous session.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {loading && subject === 'Chemistry' && chemistryPapers.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading papers from server...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment for the first load</p>
          </div>
        ) : (
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
              chemistryPapers.length > 0 ? (
                chemistryPapers.map((paper, index) => (
                  <PaperCard 
                    key={paper.paper_id || `chemistry-paper-${index}`}
                    paper={{
                      id: paper.paper_id || `PAPER-${paper.year}-${index}`,
                      year: paper.year,
                      subject: 'Chemistry',
                      title: paper.title || `Chemistry Examination ${paper.year}`,
                      questions: [],
                      duration: paper.duration || 60,
                    }} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">No papers available yet</p>
                  <Button 
                    onClick={handleRefresh} 
                    variant="outline" 
                    className="mt-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )
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
        )}
      </div>
    </div>
  );
};