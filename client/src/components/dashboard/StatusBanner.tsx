import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Pause } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface StatusBannerProps {
  userId: number;
}

export default function StatusBanner({ userId }: StatusBannerProps) {
  const { toast } = useToast();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async (start: boolean) => {
      const endpoint = start ? "start-automation" : "stop-automation";
      const response = await apiRequest("POST", `/api/users/${userId}/${endpoint}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "applications"] });
      
      toast({
        title: variables ? "Automation Started" : "Automation Stopped",
        description: variables 
          ? "Easy Eddy is now searching and applying to jobs for you"
          : "Job application automation has been paused",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to toggle automation. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  return (
    <div className="mb-8 bg-brand-green-light bg-opacity-20 border border-brand-green-light rounded-lg p-4">
      <div className="flex items-center">
        <CheckCircle className="text-brand-green mr-3" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-brand-green-dark">
            {user.automationActive ? "Automation Active" : "Automation Paused"}
          </h3>
          <p className="text-sm text-gray-600">
            {user.automationActive 
              ? "Easy Eddy is actively searching and applying to jobs on your behalf"
              : "Job application automation is currently paused"
            }
          </p>
        </div>
        <div className="ml-4">
          <Button
            onClick={() => toggleAutomationMutation.mutate(!user.automationActive)}
            disabled={toggleAutomationMutation.isPending}
            className={
              user.automationActive
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-brand-green hover:bg-brand-green-dark text-white"
            }
          >
            {toggleAutomationMutation.isPending ? (
              "Processing..."
            ) : user.automationActive ? (
              <>
                <Pause size={16} className="mr-2" />
                Pause Automation
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Start Automation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
