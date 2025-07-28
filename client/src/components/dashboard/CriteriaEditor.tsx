import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Plus, X, Bot, Sparkles } from "lucide-react";
import type { JobCriteria } from "@shared/schema";

interface CriteriaEditorProps {
  userId: number;
  criteria?: JobCriteria;
}

export default function CriteriaEditor({ userId, criteria }: CriteriaEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitles: criteria?.jobTitles || [],
    industries: criteria?.industries || [],
    locations: criteria?.locations || [],
    skills: criteria?.skills || [],
    experienceLevel: criteria?.experienceLevel || "",
    remotePreference: criteria?.remotePreference || "",
    salaryMin: criteria?.salaryMin || 0,
    salaryMax: criteria?.salaryMax || 0,
    jobTypes: criteria?.jobTypes || []
  });

  const [newInput, setNewInput] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);

  // Update criteria mutation
  const updateCriteriaMutation = useMutation({
    mutationFn: async (criteriaData: any) => {
      const endpoint = criteria ? 
        `/api/users/${userId}/job-criteria` : 
        `/api/users/${userId}/job-criteria`;
      
      return await apiRequest({
        url: endpoint,
        method: criteria ? "PATCH" : "POST",
        body: criteriaData
      });
    },
    onSuccess: () => {
      toast({
        title: "Criteria Updated",
        description: "Your job search criteria has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "job-criteria"] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update criteria",
        variant: "destructive",
      });
    }
  });

  // Get AI suggestions mutation
  const getSuggestionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: `/api/users/${userId}/suggest-criteria`,
        method: "POST"
      });
    },
    onSuccess: (data: any) => {
      const suggestions = data.suggestions;
      setFormData(prev => ({
        ...prev,
        jobTitles: [...new Set([...prev.jobTitles, ...suggestions.suggestedTitles])],
        industries: [...new Set([...prev.industries, ...suggestions.suggestedIndustries])],
        skills: [...new Set([...prev.skills, ...suggestions.suggestedSkills])],
        salaryMin: suggestions.suggestedSalaryRange.min,
        salaryMax: suggestions.suggestedSalaryRange.max
      }));
      setIsLoadingSuggestions(false);
      toast({
        title: "Smart Suggestions Applied",
        description: suggestions.reasoning || "Applied intelligent suggestions based on your CV.",
      });
    },
    onError: (error: any) => {
      setIsLoadingSuggestions(false);
      toast({
        title: "Suggestions Failed",
        description: error.message || "Failed to get smart suggestions",
        variant: "destructive",
      });
    }
  });

  const addToArray = (field: keyof typeof formData, value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
    setNewInput("");
  };

  const removeFromArray = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item: string) => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCriteriaMutation.mutate(formData);
  };

  const handleAISuggestions = () => {
    setIsLoadingSuggestions(true);
    getSuggestionsMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-brand-green hover:bg-brand-green-dark text-white"
          size="sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          {criteria ? "Edit Criteria" : "Set Criteria"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Job Search Criteria
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Suggestions Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Configure your job search preferences</p>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleAISuggestions}
              disabled={isLoadingSuggestions}
              className="flex items-center gap-2"
            >
              {isLoadingSuggestions ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Getting smart suggestions...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  Get Smart Suggestions
                </>
              )}
            </Button>
          </div>

          {/* Job Titles */}
          <div>
            <Label className="text-sm font-medium">Job Titles</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                placeholder="Add job title..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('jobTitles', newInput);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('jobTitles', newInput)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.jobTitles.map((title) => (
                <Badge key={title} variant="secondary" className="flex items-center gap-1">
                  {title}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray('jobTitles', title)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div>
            <Label className="text-sm font-medium">Industries</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={activeField === 'industries' ? newInput : ''}
                onChange={(e) => {
                  setActiveField('industries');
                  setNewInput(e.target.value);
                }}
                placeholder="Add industry..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('industries', newInput);
                    setActiveField(null);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('industries', newInput);
                  setActiveField(null);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.industries.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                  {industry}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray('industries', industry)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <Label className="text-sm font-medium">Locations</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={activeField === 'locations' ? newInput : ''}
                onChange={(e) => {
                  setActiveField('locations');
                  setNewInput(e.target.value);
                }}
                placeholder="Add location..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('locations', newInput);
                    setActiveField(null);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('locations', newInput);
                  setActiveField(null);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.locations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromArray('locations', location)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-sm font-medium">Experience Level</Label>
            <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="lead">Lead Level</SelectItem>
                <SelectItem value="executive">Executive Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remote Preference */}
          <div>
            <Label className="text-sm font-medium">Remote Preference</Label>
            <Select value={formData.remotePreference} onValueChange={(value) => setFormData(prev => ({ ...prev, remotePreference: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select remote preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote-only">Remote Only</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Minimum Salary</Label>
              <Input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Maximum Salary</Label>
              <Input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="mt-2"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-green hover:bg-brand-green-dark"
              disabled={updateCriteriaMutation.isPending}
            >
              {updateCriteriaMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Criteria"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}