import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { SubjectSelection } from "./pages/SubjectSelection";
import { PapersList } from "./pages/PapersList";
import { Quiz } from "./pages/Quiz";
import { Results } from "./pages/Results";
import { Review } from "./pages/Review";
import { History } from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectSelection />} />
          <Route path="/papers/:subject" element={<PapersList />} />
          <Route path="/quiz/:paperId" element={<Quiz />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/review/:attemptId" element={<Review />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
