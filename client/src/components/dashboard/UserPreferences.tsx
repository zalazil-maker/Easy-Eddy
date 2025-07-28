import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Settings, Bell, Search, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UserPreferences, InsertUserPreferences } from "@shared/schema";

interface UserPreferencesProps {
  userId: number;
}

export default function UserPreferences({ userId }: UserPreferencesProps) {
  const queryClient = useQueryClient();
  
  const { data: preferences, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/preferences`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/preferences`);
      if (!response.ok && response.status !== 404) throw new Error("Failed to fetch preferences");
      return response.status === 404 ? null : response.json();
    },
  });

  const [newCompany, setNewCompany] = useState("");
  const [newJobBoard, setNewJobBoard] = useState("");

  const updatePreferences = useMutation({
    mutationFn: (data: Partial<UserPreferences>) => 
      apiRequest(`/api/users/${userId}/preferences`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/preferences`] });
    },
  });

  const createPreferences = useMutation({
    mutationFn: (data: InsertUserPreferences) => 
      apiRequest(`/api/users/${userId}/preferences`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/preferences`] });
    },
  });

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    if (preferences) {
      updatePreferences.mutate(updates);
    } else {
      createPreferences.mutate({ userId, ...updates } as InsertUserPreferences);
    }
  };

  const addCompany = (type: 'excluded' | 'priority') => {
    if (!newCompany.trim()) return;
    
    const currentList = preferences?.[type === 'excluded' ? 'excludedCompanies' : 'priorityCompanies'] || [];
    const updatedList = [...currentList, newCompany.trim()];
    
    handleUpdate({
      [type === 'excluded' ? 'excludedCompanies' : 'priorityCompanies']: updatedList
    });
    setNewCompany("");
  };

  const removeCompany = (company: string, type: 'excluded' | 'priority') => {
    const currentList = preferences?.[type === 'excluded' ? 'excludedCompanies' : 'priorityCompanies'] || [];
    const updatedList = currentList.filter(c => c !== company);
    
    handleUpdate({
      [type === 'excluded' ? 'excludedCompanies' : 'priorityCompanies']: updatedList
    });
  };

  const addJobBoard = () => {
    if (!newJobBoard.trim()) return;
    
    const currentList = preferences?.preferredJobBoards || [];
    const updatedList = [...currentList, newJobBoard.trim()];
    
    handleUpdate({ preferredJobBoards: updatedList });
    setNewJobBoard("");
  };

  const removeJobBoard = (board: string) => {
    const currentList = preferences?.preferredJobBoards || [];
    const updatedList = currentList.filter(b => b !== board);
    
    handleUpdate({ preferredJobBoards: updatedList });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Search Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrefs = preferences || {
    maxApplicationsPerDay: 25,
    preferredSearchTime: "morning",
    autoApplyEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    dailySummaryEmail: true,
    instantNotifications: true,
    aggressiveSearch: false,
    conservativeSearch: true,
    minMatchScore: 70,
    preferredJobBoards: [],
    excludedCompanies: [],
    priorityCompanies: [],
  };

  return (
    <div className="space-y-6">
      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Daily Application Limit</Label>
            <div className="mt-2">
              <Slider
                value={[currentPrefs.maxApplicationsPerDay]}
                onValueChange={(value) => handleUpdate({ maxApplicationsPerDay: value[0] })}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>1</span>
                <span className="font-medium">{currentPrefs.maxApplicationsPerDay} applications/day</span>
                <span>50</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Preferred Search Time</Label>
            <Select 
              value={currentPrefs.preferredSearchTime} 
              onValueChange={(value) => handleUpdate({ preferredSearchTime: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (8-12 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12-6 PM)</SelectItem>
                <SelectItem value="evening">Evening (6-10 PM)</SelectItem>
                <SelectItem value="any">Any Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Auto Apply Enabled</Label>
            <Switch
              checked={currentPrefs.autoApplyEnabled}
              onCheckedChange={(checked) => handleUpdate({ autoApplyEnabled: checked })}
            />
          </div>

          <div>
            <Label>Minimum Match Score</Label>
            <div className="mt-2">
              <Slider
                value={[currentPrefs.minMatchScore]}
                onValueChange={(value) => handleUpdate({ minMatchScore: value[0] })}
                max={100}
                min={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>30%</span>
                <span className="font-medium">{currentPrefs.minMatchScore}% minimum</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={currentPrefs.emailNotifications}
              onCheckedChange={(checked) => handleUpdate({ emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Daily Summary Email</Label>
            <Switch
              checked={currentPrefs.dailySummaryEmail}
              onCheckedChange={(checked) => handleUpdate({ dailySummaryEmail: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Instant Notifications</Label>
            <Switch
              checked={currentPrefs.instantNotifications}
              onCheckedChange={(checked) => handleUpdate({ instantNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Aggressive Search</Label>
              <p className="text-sm text-gray-500">Apply to more jobs with lower match scores</p>
            </div>
            <Switch
              checked={currentPrefs.aggressiveSearch}
              onCheckedChange={(checked) => handleUpdate({ aggressiveSearch: checked, conservativeSearch: !checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Conservative Search</Label>
              <p className="text-sm text-gray-500">Only apply to high-match jobs</p>
            </div>
            <Switch
              checked={currentPrefs.conservativeSearch}
              onCheckedChange={(checked) => handleUpdate({ conservativeSearch: checked, aggressiveSearch: !checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Company Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Priority Companies</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add priority company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompany('priority')}
              />
              <Button onClick={() => addCompany('priority')} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(currentPrefs.priorityCompanies || []).map((company) => (
                <Badge key={company} variant="secondary" className="cursor-pointer" onClick={() => removeCompany(company, 'priority')}>
                  {company} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Excluded Companies</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add company to exclude"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompany('excluded')}
              />
              <Button onClick={() => addCompany('excluded')} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(currentPrefs.excludedCompanies || []).map((company) => (
                <Badge key={company} variant="destructive" className="cursor-pointer" onClick={() => removeCompany(company, 'excluded')}>
                  {company} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Preferred Job Boards</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add job board"
                value={newJobBoard}
                onChange={(e) => setNewJobBoard(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addJobBoard()}
              />
              <Button onClick={addJobBoard} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(currentPrefs.preferredJobBoards || []).map((board) => (
                <Badge key={board} variant="outline" className="cursor-pointer" onClick={() => removeJobBoard(board)}>
                  {board} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}