import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobCriteria } from "@shared/schema";
import CriteriaEditor from "./CriteriaEditor";

interface SearchCriteriaProps {
  userId: number;
}

export default function SearchCriteria({ userId }: SearchCriteriaProps) {
  const { data: criteria } = useQuery<JobCriteria>({
    queryKey: ["/api/users", userId, "job-criteria"],
  });

  if (!criteria) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">No search criteria set</p>
            <CriteriaEditor userId={userId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `From $${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">Search Criteria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Job Titles
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {criteria.jobTitles.map((title, index) => (
              <Badge key={index} variant="secondary">
                {title}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Locations
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {criteria.locations.map((location, index) => (
              <Badge key={index} variant="secondary">
                {location}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Salary Range
          </label>
          <p className="text-sm text-gray-800 mt-1">
            {formatSalary(criteria.salaryMin, criteria.salaryMax)}
          </p>
        </div>
        
        <CriteriaEditor userId={userId} criteria={criteria} />
      </CardContent>
    </Card>
  );
}
