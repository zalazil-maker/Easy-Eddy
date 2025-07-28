import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Clock, CheckCircle, AlertCircle, Bot } from "lucide-react";

interface JobSearchButtonProps {
  userId: number;
}

export default function JobSearchButton({ userId }: JobSearchButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSearching, setIsSearching] = useState(false);

  const startJobSearchMutation = useMutation({
    mutationFn: async () => {
      setIsSearching(true);
      const response = await apiRequest("POST", "/api/trigger-job-search");
      return response;
    },
    onSuccess: (data: any) => {
      setIsSearching(false);
      toast({
        title: "Smart Job Search Started!",
        description: `System is analyzing your CV and matching jobs intelligently. You'll receive notifications as applications are sent.`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'stats'] });
    },
    onError: (error: any) => {
      setIsSearching(false);
      const errorMessage = error.message || "Failed to start job search";
      
      // Check if error contains missing fields information
      if (error.message && error.message.includes("Missing required information:")) {
        toast({
          title: "Complete Your Profile First",
          description: error.message,
          variant: "destructive",
        });
      } else if (errorMessage.includes("limit reached") || errorMessage.includes("daily limit")) {
        toast({
          title: "Application Limit Reached",
          description: "You've reached your application limit for your subscription. Upgrade your plan or wait for the reset.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("missing criteria") || errorMessage.includes("job criteria")) {
        toast({
          title: "Setup Required",
          description: "Please complete your job criteria setup first.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("missing CV") || errorMessage.includes("CV upload")) {
        toast({
          title: "CV Required",
          description: "Please upload your CV before starting job search.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  const handleStartSearch = () => {
    startJobSearchMutation.mutate();
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-green-600" />
          Smart Job Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Click the button below to start today's smart job search and application process.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Up to 25 applications</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-600" />
                <span>Smart matching</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-purple-600" />
                <span>Real-time notifications</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartSearch}
            disabled={isSearching || startJobSearchMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {isSearching || startJobSearchMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching & Applying...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Start Smart Apply Now
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            <p>Manual trigger required daily for privacy and control</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}