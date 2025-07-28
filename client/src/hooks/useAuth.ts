import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  fullName: string | null;
  email: string;
  isApproved: boolean;
  subscriptionTier: string | null;
  hasCompletedOnboarding: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    isApproved: (user as User)?.isApproved || false,
    hasCompletedOnboarding: (user as User)?.hasCompletedOnboarding || false,
    error,
  };
}