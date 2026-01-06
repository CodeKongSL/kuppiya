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

// Public token for accessing public endpoints
const PUBLIC_API_TOKEN = import.meta.env.VITE_PUBLIC_API_TOKEN || "sk-LD9m2VqRkZ7pHxF3uBvJtWnXyAeCs48YiQMBgaKPT1rLoSxUEhfCzNdA63yVwmKEXRb4qNpTdGVYuZcHJWkmfBsX5a9LtoP";

const AppContent = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const { toast } = useToast();
  const [showNicDialog, setShowNicDialog] = useState(false);
  const [nicNumber, setNicNumber] = useState("");
  const [nicLoading, setNicLoading] = useState(false);

  // Debug: Check if public token is loaded
  console.log("PUBLIC_API_TOKEN loaded:", PUBLIC_API_TOKEN ? `Yes (${PUBLIC_API_TOKEN.substring(0, 20)}...)` : "NO - MISSING!");

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
        // Check localStorage first to avoid unnecessary API calls
        const userCreated = localStorage.getItem(`user_created_${user.sub}`);
        
        if (userCreated) {
          console.log("User already created (from localStorage)");
          return;
        }

        // For new users or users without localStorage flag, show NIC dialog
        // We'll determine if they're truly new when they submit the NIC
        console.log("Checking if user needs NIC dialog");
        setShowNicDialog(true);
      }
    };

    checkUserExists();
  }, [isAuthenticated, user]);

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
      // Step 1: Check if user with this NIC already exists using public endpoint
      console.log("Checking if user exists with NIC:", nicNumber);
      console.log("Public Token for check:", PUBLIC_API_TOKEN ? "Token exists" : "Token is missing!");
      
      const checkResponse = await fetch(
        `https://paper-system-api.codekongsl.com/PaperMgt/public/users/check?id_number=${nicNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${PUBLIC_API_TOKEN}`,
          },
        }
      );
      
      console.log("Check response status:", checkResponse.status);

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log("User check response:", checkData);
        
        if (checkData.exists) {
          // User with this NIC already exists
          if (checkData.username === user?.email) {
            // Same user - this is a returning user
            localStorage.setItem(`user_created_${user?.sub}`, "true");
            toast({
              title: "Welcome Back!",
              description: "Your account already exists.",
            });
            setShowNicDialog(false);
            return;
          } else {
            // Different user - NIC is taken
            throw new Error(
              `This NIC number is already registered with ${checkData.username}. Please use a different NIC or contact support.`
            );
          }
        }
      }

      // Step 2: User doesn't exist, create new user
      console.log("Creating new user...");
      
      // Get Auth0 token for the Create/User endpoint
      const token = await getAccessTokenSilently();
      
      const requestBody = {
        username: user?.email,
        id_number: nicNumber,
        auth0_sub: user?.sub,
      };
      console.log("Request body:", requestBody);
      
      const response = await fetch(
        "https://paper-system-api.codekongsl.com/PaperMgt/api/Create/User",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Use Auth0 token for this endpoint
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      console.log("Create user response status:", response.status);

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
            errorMessage.toLowerCase().includes("email") ||
            errorMessage.toLowerCase().includes("username")) {
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
      } else if (response.status === 401) {
        // Unauthorized - token issue
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Authentication failed";
        
        console.error("401 Error details:", errorData);
        
        // Try to provide more helpful error message
        if (errorMessage.includes("User ID not found in metadata")) {
          throw new Error(
            "Authentication setup incomplete. Please contact support with this error: Backend requires user_id in token metadata for new user registration."
          );
        } else {
          throw new Error(`Authentication error: ${errorMessage}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Failed to create user (${response.status})`);
      }
    } catch (error) {
      console.error("NIC submission error:", error);
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
