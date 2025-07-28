import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface CVStatusProps {
  userId: number;
}

export default function CVStatus({ userId }: CVStatusProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const optimizeCVMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: `/api/users/${userId}/analyze-cv`,
        method: "POST"
      });
    },
    onSuccess: (data) => {
      toast({
        title: "CV Analysis Complete",
        description: `Your CV has been analyzed. Score: ${data.analysis?.overallScore || 0}%`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze CV. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!user) return null;

  const optimizationScore = user.cvOptimizationScore || 0;
  const suggestions = user.aiSuggestions || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">CV Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Optimization Score</span>
          <span className="text-sm font-medium text-brand-green">{optimizationScore}%</span>
        </div>
        
        <Progress value={optimizationScore} className="h-2" />
        
        {suggestions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Lightbulb className="text-blue-600 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-medium text-blue-800">AI Suggestion</p>
                <p className="text-xs text-blue-700">
                  {suggestions[0] || "Add more quantified achievements to your experience section"}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Button 
          className="w-full bg-brand-green text-white hover:bg-brand-green-dark cursor-pointer"
          onClick={() => optimizeCVMutation.mutate()}
          disabled={optimizeCVMutation.isPending}
        >
          {optimizeCVMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze CV"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
