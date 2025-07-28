import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check, 
  Crown, 
  Zap, 
  ArrowRight,
  Bot,
  Calendar,
  Target,
  Loader2
} from "lucide-react";

interface PostSignupSubscriptionProps {
  userId: number;
  onSkip: () => void;
  onPlanSelected: (planType: string) => void;
}

export default function PostSignupSubscription({ 
  userId, 
  onSkip, 
  onPlanSelected 
}: PostSignupSubscriptionProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Create Stripe checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async (planType: string) => {
      const response = await apiRequest({
        url: "/api/subscription/subscribe",
        method: "POST",
        body: { 
          planType
        }
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Free plan selected
        onPlanSelected(data.planType || "free");
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSelectPlan = (planType: string) => {
    setSelectedPlan(planType);
    if (planType === "free") {
      onPlanSelected(planType);
      navigate("/dashboard");
    } else {
      createCheckoutMutation.mutate(planType);
    }
  };

  const plans = [
    {
      type: "free",
      name: "Free Plan",
      price: "€0",
      period: "forever",
      applications: "10 per week",
      icon: Bot,
      color: "bg-gray-100",
      textColor: "text-gray-700",
      features: [
        "10 job applications per week",
        "Basic CV analysis",
        "Job matching",
        "Email notifications",
        "Standard support"
      ],
      popular: false
    },
    {
      type: "weekly",
      name: "Weekly Pro",
      price: "€2",
      period: "per week",
      applications: "10 per day",
      icon: Zap,
      color: "bg-blue-100",
      textColor: "text-blue-700",
      features: [
        "10 job applications per day",
        "Advanced CV optimization",
        "Priority job matching",
        "Real-time notifications",
        "Priority support",
        "Weekly analytics reports"
      ],
      popular: true
    },
    {
      type: "monthly",
      name: "Monthly Pro",
      price: "€4.99",
      period: "per month",
      applications: "15 per day",
      icon: Crown,
      color: "bg-green-100",
      textColor: "text-green-700",
      features: [
        "15 job applications per day",
        "Premium CV optimization",
        "Intelligent job targeting",
        "Instant notifications",
        "Premium support",
        "Advanced analytics",
        "Custom job criteria",
        "Export reports"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-brand-green" />
            <h1 className="text-2xl font-bold text-gray-900">Easy Eddy</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome! Select the plan that best fits your job search needs. 
            You can always upgrade or downgrade later.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isSelected = selectedPlan === plan.type;
            const isLoading = createCheckoutMutation.isPending && selectedPlan === plan.type;
            
            return (
              <Card 
                key={plan.type}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? 'ring-2 ring-brand-green scale-105' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => !isLoading && handleSelectPlan(plan.type)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-brand-green text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-8 w-8 ${plan.textColor}`} />
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-brand-green font-medium">
                    <Target className="h-4 w-4" />
                    {plan.applications}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.type);
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        {plan.type === "free" ? "Start Free" : "Choose Plan"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now - I'll choose later
          </Button>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-center mb-6">
            What makes Easy Eddy special?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Smart Automation</h4>
              <p className="text-sm text-gray-600">
                AI-powered job matching and application automation
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Targeted Applications</h4>
              <p className="text-sm text-gray-600">
                Apply only to jobs that match your criteria and skills
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Daily Automation</h4>
              <p className="text-sm text-gray-600">
                Consistent daily job applications while you focus on other things
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}