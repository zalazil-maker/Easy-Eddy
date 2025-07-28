import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ContactInfo from "@/components/onboarding/ContactInfo";
import CVUpload from "@/components/onboarding/CVUpload";
import JobCriteria from "@/components/onboarding/JobCriteria";
import LanguagePreferences from "@/components/onboarding/LanguagePreferences";
import CVManagement from "@/components/onboarding/CVManagement";
import PostSignupSubscription from "@/components/PostSignupSubscription";
import BackgroundIllustration from "@/components/ui/background-illustration";
import { Bot, X } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    linkedinProfile: "",
    privacyPolicyAccepted: false,
    cvContent: "",
    jobTitles: [],
    locations: [],
    salaryMin: 0,
    salaryMax: 0,
    experienceLevel: "",
    remotePreference: "",
  });

  const updateUserData = (updates: any) => {
    console.log("Onboarding: Updating userData with:", updates);
    setUserData(prev => {
      const newData = { ...prev, ...updates };
      console.log("Onboarding: New userData:", newData);
      return newData;
    });
  };

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    console.log("handleNext called, currentStep:", currentStep, "userData:", userData);
    setIsLoading(true);
    
    try {
      if (currentStep === 1) {
      // Validate required fields for step 1
      if (!userData.email || !userData.password || !userData.confirmPassword || !userData.phone || !userData.privacyPolicyAccepted) {
        console.log("Missing required fields:", { 
          email: userData.email, 
          password: userData.password ? "***" : "", 
          confirmPassword: userData.confirmPassword ? "***" : "",
          phone: userData.phone, 
          privacyPolicyAccepted: userData.privacyPolicyAccepted 
        });
        toast({
          title: "Missing Required Information",
          description: "Please fill in all required fields including email, password, phone number, and accept the privacy policy.",
          variant: "destructive",
        });
        setIsLoading(false);
        return; // Don't proceed if required fields are missing
      }
      
      // Validate password match
      if (userData.password !== userData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords don't match. Please check and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Create user after step 1
        const userResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            linkedinProfile: userData.linkedinProfile,
            privacyPolicyAccepted: userData.privacyPolicyAccepted,
          }),
        });
        
        if (userResponse.ok) {
          const user = await userResponse.json();
          sessionStorage.setItem("easy_eddy_user_id", user.id.toString());
          setCreatedUserId(user.id);
          setCurrentStep(currentStep + 1);
          toast({
            title: "Account Created",
            description: "Your account has been created successfully!",
          });
        } else {
          const errorData = await userResponse.json();
          console.error("Failed to create user:", errorData);
          
          // Handle duplicate email case
          if (errorData.error?.includes("duplicate key value violates unique constraint")) {
            toast({
              title: "Email Already Exists",
              description: "An account with this email already exists. Please use a different email address.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Account Creation Failed",
              description: errorData.message || "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding and show subscription selection
        const userId = sessionStorage.getItem("easy_eddy_user_id");
        if (userId) {
          // Create job criteria if provided
          if (userData.jobTitles.length > 0 || userData.locations.length > 0) {
            await fetch(`/api/users/${userId}/job-criteria`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobTitles: userData.jobTitles,
                locations: userData.locations,
                salaryMin: userData.salaryMin,
                salaryMax: userData.salaryMax,
                experienceLevel: userData.experienceLevel,
                remotePreference: userData.remotePreference,
              }),
            });
          }
          
          // Show subscription selection instead of going to access-pending
          setShowSubscription(true);
        }
      }
    } catch (error) {
      console.error("Failed to proceed:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setLocation("/dashboard");
  };

  const handleSubscriptionSkip = () => {
    setLocation("/dashboard");
  };

  const handlePlanSelected = (planType: string) => {
    // Plan selection completed, go to dashboard
    if (planType === "free") {
      setLocation("/dashboard");
    } else {
      // For paid plans, Stripe will handle the redirect
      // The user will come back to dashboard after successful payment
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Contact Information";
      case 2:
        return "Language Preferences";
      case 3:
        return "CV Management";
      case 4:
        return "Job Search Criteria";
      default:
        return "Setup";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "We need your contact details to apply for jobs and send you notifications.";
      case 2:
        return "Select the languages you speak for job matching";
      case 3:
        return "Upload your CVs in different languages";
      case 4:
        return "Tell us what kind of jobs you're looking for";
      default:
        return "Let's set up your automated job search";
    }
  };

  const renderStep = () => {
    const userId = sessionStorage.getItem("easy_eddy_user_id");
    
    switch (currentStep) {
      case 1:
        return (
          <ContactInfo
            data={userData}
            onUpdate={updateUserData}
          />
        );
      case 2:
        return userId ? (
          <LanguagePreferences userId={parseInt(userId)} />
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-600">Please complete step 1 first.</p>
          </div>
        );
      case 3:
        return userId ? (
          <CVUpload
            data={userData}
            onUpdate={updateUserData}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-600">Please complete step 1 first.</p>
          </div>
        );
      case 4:
        return (
          <JobCriteria
            data={userData}
            onUpdate={updateUserData}
          />
        );
      default:
        return null;
    }
  };

  // Show subscription selection after onboarding completion
  if (showSubscription && createdUserId) {
    return (
      <PostSignupSubscription
        userId={createdUserId}
        onSkip={handleSubscriptionSkip}
        onPlanSelected={handlePlanSelected}
      />
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundIllustration />
      
      {/* Hero Message */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>
          Let AI look for your next job
        </h1>
        <p className="text-xl md:text-2xl text-green-400 font-medium" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
          and enjoy extra 10 hours a week
        </p>
      </div>
      
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-black">Welcome to Easy Eddy</CardTitle>
                <p className="text-sm text-gray-600">Let's set up your automated job search</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-brand-green">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-black mb-2">{getStepTitle()}</h3>
              <p className="text-sm text-gray-600 mb-6">{getStepDescription()}</p>
            </div>

            {renderStep()}
          </div>
        </CardContent>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? handleSkip : handleBack}
              className="px-4 py-2"
            >
              {currentStep === 1 ? "Skip Setup" : "Back"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-2 bg-brand-green hover:bg-brand-green-dark"
            >
              {isLoading 
                ? "Processing..." 
                : currentStep === totalSteps 
                  ? "Complete Setup" 
                  : "Continue"
              }
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
