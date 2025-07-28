import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bot, Eye, EyeOff } from "lucide-react";
import { safeFetch } from "@/lib/browserUtils";
import BackgroundIllustration from "@/components/ui/background-illustration";

// Safe storage utilities
const safeLocalStorageSet = (key: string, value: string) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error("LocalStorage set error:", error);
  }
};

const safeSessionStorageSet = (key: string, value: string) => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    }
  } catch (error) {
    console.error("SessionStorage set error:", error);
  }
};

const safeLocalStorageRemove = (key: string) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.error("LocalStorage remove error:", error);
  }
};

const safeSessionStorageRemove = (key: string) => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.error("SessionStorage remove error:", error);
  }
};

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Helper function to update form data
  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value.trim() }));
  };

  // Clear storage on component mount
  useEffect(() => {
    safeLocalStorageRemove("easy_eddy_session_token");
    safeSessionStorageRemove("easy_eddy_user_id");
    setCheckingSession(false);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedPrivacy) {
      toast({
        title: "Privacy Policy Required",
        description: "Please accept the Privacy Policy and Terms to sign in.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await safeFetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign-in failed");
      }

      const data = await response.json();
      safeLocalStorageSet("easy_eddy_session_token", data.token);
      safeSessionStorageSet("easy_eddy_user_id", data.userId);

      toast({
        title: "Success",
        description: "Successfully signed in!",
        variant: "default",
      });

      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <BackgroundIllustration />
        <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Bot className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="text-xl font-semibold">Checking your session...</h2>
              <p className="text-gray-600">Please wait while we check if you're already signed in.</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundIllustration />
      
      {/* Hero Message */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-4" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}>
          Let AI look for your next job
        </h1>
        <p className="text-xl md:text-2xl text-green-400 font-medium" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>
          and enjoy extra 10 hours a week
        </p>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <Bot className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your Easy Eddy account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="privacy"
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4"
              />
              <Label htmlFor="privacy" className="text-sm">
                I accept the{" "}
                <a href="/privacy" className="text-green-600 hover:underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="text-green-600 hover:underline">
                  Terms
                </a>
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/onboarding")}
                className="font-medium text-green-600 hover:text-green-500"
                disabled={isLoading}
              >
                Create Account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
