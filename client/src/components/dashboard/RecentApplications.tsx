import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { FaLinkedin, FaBuilding, FaSearch } from "react-icons/fa";
import type { JobApplication } from "@shared/schema";

interface RecentApplicationsProps {
  userId: number;
}

export default function RecentApplications({ userId }: RecentApplicationsProps) {
  const { data: applications, isLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/users", userId, "applications"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "linkedin":
        return <FaLinkedin className="text-blue-600" />;
      case "indeed":
        return <FaSearch className="text-gray-600" />;
      case "glassdoor":
        return <FaBuilding className="text-green-600" />;
      default:
        return <FaBuilding className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return (
          <Badge className="bg-brand-green-light bg-opacity-20 text-brand-green-dark">
            Applied
          </Badge>
        );
      case "viewed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Viewed
          </Badge>
        );
      case "response":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Response
          </Badge>
        );
      case "interview":
        return (
          <Badge className="bg-green-100 text-green-800">
            Interview
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-black">Recent Applications</CardTitle>
          <Button
            variant="ghost"
            className="text-brand-green hover:text-brand-green-dark text-sm font-medium cursor-pointer"
            onClick={() => alert('View all applications page coming soon!')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {applications?.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No applications yet. Start automation to begin applying!
            </div>
          ) : (
            applications?.slice(0, 5).map((application) => (
              <div
                key={application.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getSourceIcon(application.source)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-black">{application.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{application.company}</p>
                        <p className="text-xs text-gray-500">{application.location}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-4">
                      {getStatusBadge(application.status)}
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(new Date(application.appliedAt!))}
                      </span>
                      <span className="text-xs text-gray-500">
                        Match: {application.matchScore}%
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {application.jobUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-gray-400 hover:text-brand-green"
                        onClick={() => window.open(application.jobUrl, "_blank")}
                      >
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
