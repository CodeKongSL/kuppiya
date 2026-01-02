import { useAuth0 } from "@auth0/auth0-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { LogOut, Loader2, User, Mail } from "lucide-react";
import { initializeApiClient } from "./services/apiClient";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const UserProfile = () => {
  const { logout, user } = useAuth0();

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium leading-none">{user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const { toast } = useToast();
  const [showNicDialog, setShowNicDialog] = useState(false);
  const [nicNumber, setNicNumber] = useState("");
  const [nicLoading, setNicLoading] = useState(false);

  // Initialize API client with Auth0 token getter
  useEffect(() => {
    if (isAuthenticated) {
      initializeApiClient({
        getAccessToken: getAccessTokenSilently,
      });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Check if new user needs to provide NIC
  useEffect(() => {
    const checkUserExists = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          
          // Get all users and check if current user exists
          const response = await fetch(
            "https://paper-system-api.codekongsl.com/PaperMgt/api/FindAll/Users",
            {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            const users = result.data || [];
            
            // Check if user with this email exists
            const userExists = users.some((u: any) => u.username === user.email);

            if (userExists) {
              // User exists in backend - existing user logging in
              console.log("User exists in backend, skipping NIC dialog");
              localStorage.setItem(`user_created_${user.sub}`, "true");
            } else {
              // User doesn't exist - new signup
              console.log("New user detected, showing NIC dialog");
              setShowNicDialog(true);
            }
          } else {
            console.error("Error fetching users:", response.status);
            // Fallback: check localStorage
            const userCreated = localStorage.getItem(`user_created_${user.sub}`);
            if (!userCreated) {
              setShowNicDialog(true);
            }
          }
        } catch (error) {
          console.error("Failed to check user existence:", error);
          // Fallback: check localStorage
          const userCreated = localStorage.getItem(`user_created_${user.sub}`);
          if (!userCreated) {
            setShowNicDialog(true);
          }
        }
      }
    };

    checkUserExists();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const handleNicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nicNumber.trim()) {
      toast({
        title: "NIC Required",
        description: "Please enter your NIC number to continue.",
        variant: "destructive",
      });
      return;
    }

    setNicLoading(true);

    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(
        "https://paper-system-api.codekongsl.com/PaperMgt/api/Create/User",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: user?.email,
            id_number: nicNumber,
          }),
        }
      );

      if (response.ok) {
        // Successfully created user
        localStorage.setItem(`user_created_${user?.sub}`, "true");
        
        toast({
          title: "Account Setup Complete!",
          description: "Welcome to Paper Management System",
        });

        setShowNicDialog(false);
      } else if (response.status === 409) {
        // Conflict - check if it's duplicate user or duplicate NIC
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "";
        
        if (errorMessage.toLowerCase().includes("user already exists") || 
            errorMessage.toLowerCase().includes("email")) {
          // Same user trying again - treat as success
          localStorage.setItem(`user_created_${user?.sub}`, "true");
          toast({
            title: "Welcome Back!",
            description: "Your account already exists.",
          });
          setShowNicDialog(false);
        } else {
          // NIC taken by another user
          throw new Error("This NIC number is already registered with another account.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify NIC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNicLoading(false);
    }
  };

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
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
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

      {/* NIC Collection Dialog for New Users */}
      <Dialog open={showNicDialog} onOpenChange={(open) => {
        // Prevent closing dialog by clicking outside
        if (!open) return;
      }}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please enter your NIC number to complete your account setup. This is required for verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNicSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nic" className="text-sm font-medium">
                NIC Number<span className="text-red-500">*</span>
              </Label>
              <Input
                id="nic"
                type="text"
                required
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                className="focus:border-blue-600 focus:ring-blue-600"
                placeholder="Enter your NIC number"
                disabled={nicLoading}
              />
              <p className="text-xs text-gray-500">
                Each NIC can only be associated with one account.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={nicLoading}
            >
              {nicLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
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
