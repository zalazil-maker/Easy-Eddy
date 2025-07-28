import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Zap, Bot } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionPlan {
  id: number;
  planType: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string | null;
  applicationsPerDay: number;
  applicationsPerWeek: number;
  features: string[];
}

interface UserSubscription {
  plan: SubscriptionPlan | null;
  status: string;
  applicationsUsedToday: number;
  applicationsUsedThisWeek: number;
  applicationsLeft: number;
  resetTime: string;
}

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: userSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/subscription/user"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType: string) => {
      const response = await apiRequest({
        url: "/api/subscription/subscribe",
        method: "POST",
        body: { planType }
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully!",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription/user"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest({
        url: "/api/subscription/cancel",
        method: "POST"
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planType: string) => {
    subscribeMutation.mutate(planType);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelMutation.mutate();
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "free":
        return <Bot className="h-8 w-8 text-green-600" />;
      case "weekly":
        return <Zap className="h-8 w-8 text-blue-600" />;
      case "monthly":
        return <Crown className="h-8 w-8 text-purple-600" />;
      default:
        return <Bot className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "free":
        return "text-green-600 border-green-200";
      case "weekly":
        return "text-blue-600 border-blue-200";
      case "monthly":
        return "text-purple-600 border-purple-200";
      default:
        return "text-gray-600 border-gray-200";
    }
  };

  const formatPrice = (price: number, currency: string, interval: string | null) => {
    const amount = (price / 100).toFixed(2);
    if (!interval) return "Free";
    return `€${amount}/${interval}`;
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPlan = userSubscription?.plan?.planType || "free";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your job search needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Subscription Status */}
        {userSubscription && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600" />
                Current Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold text-green-700">
                    {userSubscription.plan?.name || "Free Plan"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applications Used Today</p>
                  <p className="font-semibold">
                    {userSubscription.applicationsUsedToday} / {userSubscription.plan?.applicationsPerDay || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applications Used This Week</p>
                  <p className="font-semibold">
                    {userSubscription.applicationsUsedThisWeek} / {userSubscription.plan?.applicationsPerWeek || 10}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applications Remaining</p>
                  <p className="font-semibold text-green-600">{userSubscription.applicationsLeft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.map((plan: SubscriptionPlan) => (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.planType)} ${
                currentPlan === plan.planType ? "ring-2 ring-green-500" : ""
              }`}
            >
              {currentPlan === plan.planType && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600">
                  Current Plan
                </Badge>
              )}
              
              {plan.planType === "monthly" && (
                <Badge className="absolute -top-2 right-4 bg-purple-600">
                  Best Value
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.planType)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-gray-600">{plan.description}</p>
                <div className="text-3xl font-bold mt-4">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="font-semibold">
                      {plan.planType === "free" 
                        ? `${plan.applicationsPerWeek} per week`
                        : `${plan.applicationsPerDay} per day`
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {currentPlan === plan.planType ? (
                      plan.planType !== "free" ? (
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="w-full"
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? "Canceling..." : "Cancel Subscription"}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.planType)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={subscribeMutation.isPending}
                      >
                        {subscribeMutation.isPending ? "Processing..." : 
                          plan.planType === "free" ? "Downgrade" : "Upgrade"
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}