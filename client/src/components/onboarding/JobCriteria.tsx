import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface JobCriteriaProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export default function JobCriteria({ data, onUpdate }: JobCriteriaProps) {
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [jobTitles, setJobTitles] = useState<string[]>(data.jobTitles || []);
  const [locations, setLocations] = useState<string[]>(data.locations || []);
  const [salaryMin, setSalaryMin] = useState(data.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(data.salaryMax || "");
  const [experienceLevel, setExperienceLevel] = useState(data.experienceLevel || "");
  const [remotePreference, setRemotePreference] = useState(data.remotePreference || "");

  const addJobTitle = () => {
    if (jobTitleInput.trim() && !jobTitles.includes(jobTitleInput.trim())) {
      const newTitles = [...jobTitles, jobTitleInput.trim()];
      setJobTitles(newTitles);
      setJobTitleInput("");
      onUpdate({ jobTitles: newTitles });
    }
  };

  const removeJobTitle = (title: string) => {
    const newTitles = jobTitles.filter(t => t !== title);
    setJobTitles(newTitles);
    onUpdate({ jobTitles: newTitles });
  };

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      const newLocations = [...locations, locationInput.trim()];
      setLocations(newLocations);
      setLocationInput("");
      onUpdate({ locations: newLocations });
    }
  };

  const removeLocation = (location: string) => {
    const newLocations = locations.filter(l => l !== location);
    setLocations(newLocations);
    onUpdate({ locations: newLocations });
  };

  const handleSalaryChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (field === "min") {
      setSalaryMin(value);
      onUpdate({ salaryMin: numValue });
    } else {
      setSalaryMax(value);
      onUpdate({ salaryMax: numValue });
    }
  };

  const handleExperienceChange = (value: string) => {
    setExperienceLevel(value);
    onUpdate({ experienceLevel: value });
  };

  const handleRemotePreferenceChange = (value: string) => {
    setRemotePreference(value);
    onUpdate({ remotePreference: value });
  };

  return (
    <div className="space-y-6">
      {/* Job Titles */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Job Titles *</Label>
        <div className="mt-2 flex space-x-2">
          <Input
            value={jobTitleInput}
            onChange={(e) => setJobTitleInput(e.target.value)}
            placeholder="e.g., Frontend Developer"
            onKeyPress={(e) => e.key === "Enter" && addJobTitle()}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addJobTitle}
            className="bg-brand-green hover:bg-brand-green-dark"
          >
            Add
          </Button>
        </div>
        {jobTitles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {jobTitles.map((title, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {title}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJobTitle(title)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Locations */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Preferred Locations *</Label>
        <div className="mt-2 flex space-x-2">
          <Input
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="e.g., San Francisco, Remote"
            onKeyPress={(e) => e.key === "Enter" && addLocation()}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addLocation}
            className="bg-brand-green hover:bg-brand-green-dark"
          >
            Add
          </Button>
        </div>
        {locations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {locations.map((location, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {location}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLocation(location)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Salary Range (USD)</Label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salaryMin" className="text-xs text-gray-500">Minimum</Label>
            <Input
              id="salaryMin"
              type="number"
              value={salaryMin}
              onChange={(e) => handleSalaryChange("min", e.target.value)}
              placeholder="80000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="salaryMax" className="text-xs text-gray-500">Maximum</Label>
            <Input
              id="salaryMax"
              type="number"
              value={salaryMax}
              onChange={(e) => handleSalaryChange("max", e.target.value)}
              placeholder="120000"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Experience Level</Label>
        <Select value={experienceLevel} onValueChange={handleExperienceChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
            <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
            <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
            <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remote Preference */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Remote Work Preference</Label>
        <Select value={remotePreference} onValueChange={handleRemotePreferenceChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select remote preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote Only</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="onsite">On-site Only</SelectItem>
            <SelectItem value="no-preference">No Preference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Search Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Job Titles: {jobTitles.length > 0 ? jobTitles.join(", ") : "None specified"}</p>
            <p>Locations: {locations.length > 0 ? locations.join(", ") : "None specified"}</p>
            <p>Salary: ${salaryMin || "0"} - ${salaryMax || "unlimited"}</p>
            <p>Experience: {experienceLevel || "Not specified"}</p>
            <p>Remote: {remotePreference || "Not specified"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
