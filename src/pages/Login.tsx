import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nicNumber: "", // Dummy field for now
  });

  useEffect(() => {
    const syncUserToBackend = async () => {
      if (isAuthenticated && user) {
        // Check if this is a new user (just signed up)
        const isNewUser = localStorage.getItem('pendingUserSync');
        
        if (isNewUser) {
          try {
            const token = await getAccessTokenSilently();
            
            // Call your API after Auth0 authentication
            const response = await fetch(
              "https://paper-management-system-nfdl.onrender.com/PaperMgt/api/Create/User",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email: user.email,
                  // Add other user data as needed
                }),
              }
            );

            if (response.ok) {
              toast({
                title: "Account setup complete!",
                description: "Welcome to Paper Management System",
              });
            }
          } catch (error) {
            console.error("Error syncing user to backend:", error);
          } finally {
            localStorage.removeItem('pendingUserSync');
          }
        }
        
        navigate("/");
      }
    };

    syncUserToBackend();
  }, [isAuthenticated, user, navigate, getAccessTokenSilently, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store data temporarily for backend sync after Auth0 creates the account
      localStorage.setItem('pendingUserSync', 'true');
      localStorage.setItem('signupEmail', formData.email);
      localStorage.setItem('signupNIC', formData.nicNumber); // Store NIC for future use
      
      toast({
        title: "Redirecting to complete registration...",
        description: "Create your Auth0 account to continue",
      });
      
      // Redirect to Auth0 SIGNUP to actually create the account
      setTimeout(() => {
        loginWithRedirect({
          authorizationParams: {
            screen_hint: "signup", // This creates a new Auth0 account
            login_hint: formData.email,
          },
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate sign up. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto bg-white border-4 border-black w-16 h-16 rounded-lg flex items-center justify-center transform rotate-45">
            <div className="transform -rotate-45">
              <div className="w-8 h-8 bg-black" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Welcome</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {isSignUp 
              ? "Sign Up to dev-2a23li3sgg60bulj to continue to Paper Management."
              : "Sign Up to dev-2a23li3sgg60bulj to continue to Paper Management."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-blue-600">
                  Email address<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border-blue-500 focus:border-blue-600 focus:ring-blue-600"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nicNumber" className="text-sm font-medium text-gray-700">
                  NIC Number
                </Label>
                <Input
                  id="nicNumber"
                  name="nicNumber"
                  type="text"
                  value={formData.nicNumber}
                  onChange={handleInputChange}
                  className="focus:border-gray-400 focus:ring-gray-400"
                  placeholder="Enter your NIC number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="focus:border-gray-400 focus:ring-gray-400 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Log in
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Log in with Auth0
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <Button
                onClick={() => loginWithRedirect({
                  authorizationParams: {
                    prompt: "login",
                    connection: "google-oauth2",
                  },
                })}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
