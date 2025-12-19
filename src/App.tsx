import { useAuth0 } from "@auth0/auth0-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./pages/Dashboard";
import { SubjectSelection } from "./pages/SubjectSelection";
import { PapersList } from "./pages/PapersList";
import { Quiz } from "./pages/Quiz";
import { Results } from "./pages/Results";
import { Review } from "./pages/Review";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import NotFound from "./pages/NotFound";
import { LogOut, Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const UserProfile = () => {
  const { logout, user } = useAuth0();

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={user?.picture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user?.name}</span>
      </div>
      <Button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
        variant="outline"
        size="sm"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col">
                <header className="border-b">
                  <div className="container mx-auto flex justify-between items-center">
                    <Navigation />
                    <UserProfile />
                  </div>
                </header>
                <main className="flex-1">
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
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
