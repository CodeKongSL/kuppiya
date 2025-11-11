import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, Clock } from "lucide-react";
import { getPapersBySubject } from "@/data/examData";
import { PaperCard } from "@/components/PaperCard";
import { Button } from "@/components/ui/button";
import { bioService } from "@/bio/services/bioService";
import { BioPaper } from "@/bio/models/BioPaper";
import { chemistryService } from "@/chemistry/services/chemistryService";
import { ChemistryPaper } from "@/chemistry/models/ChemistryPaper";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PapersList = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [bioPapers, setBioPapers] = useState<BioPaper[]>([]);
  const [chemistryPapers, setChemistryPapers] = useState<ChemistryPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<string | null>(null);

  useEffect(() => {
    if (subject === 'Bio') {
      fetchBiologyPapers();
    } else if (subject === 'Chemistry') {
      fetchChemistryPapers();
    }
  }, [subject]);

  const fetchBiologyPapers = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get cache status before fetching
      const cacheStatus = bioService.getCacheStatus();
      
      if (cacheStatus.isCached && !forceRefresh) {
        const expiresInMinutes = Math.round(cacheStatus.expiresIn! / 60000);
        setCacheInfo(`Using cached data (${cacheStatus.paperCount} papers, expires in ${expiresInMinutes}m)`);
      } else {
        setCacheInfo(null);
      }

      const papers = await bioService.getAllBiologyPapers(forceRefresh);
      setBioPapers(papers);
      
      if (forceRefresh) {
        setCacheInfo(`Refreshed! Loaded ${papers.length} papers`);
        setTimeout(() => setCacheInfo(null), 3000);
      }
    } catch (err) {
      setError('Failed to load biology papers. Please try again later.');
      console.error('Error loading biology papers:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

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
    if (subject === 'Bio') {
      await fetchBiologyPapers(true);
    } else if (subject === 'Chemistry') {
      await fetchChemistryPapers(true);
    }
  };

  const handleClearCache = () => {
    if (subject === 'Bio') {
      bioService.clearCache();
      setCacheInfo('Cache cleared');
      fetchBiologyPapers(true);
    } else if (subject === 'Chemistry') {
      chemistryService.clearCache();
      setCacheInfo('Cache cleared');
      fetchChemistryPapers(true);
    }
  };

  if (!subject) {
    navigate('/subjects');
    return null;
  }

  // For Biology and Chemistry, use API data. For other subjects, use local data
  const papers = subject === 'Bio' 
    ? bioPapers 
    : subject === 'Chemistry' 
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

          {(subject === 'Bio' || subject === 'Chemistry') && !loading && (
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
                : `Choose from ${papers.length} years of past examination papers`}
            </p>
            {(subject === 'Bio' || subject === 'Chemistry') && cacheInfo && !loading && (
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
              {((subject === 'Bio' && bioPapers.length > 0) || (subject === 'Chemistry' && chemistryPapers.length > 0)) && (
                <span className="block mt-2 text-sm">
                  Showing cached papers from previous session.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {loading && (subject === 'Bio' ? bioPapers.length === 0 : subject === 'Chemistry' ? chemistryPapers.length === 0 : false) ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading papers from server...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment for the first load</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subject === 'Bio' ? (
              bioPapers.length > 0 ? (
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