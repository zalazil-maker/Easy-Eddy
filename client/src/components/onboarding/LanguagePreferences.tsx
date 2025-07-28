import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface LanguagePreferencesProps {
  userId: number;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' }
];

export default function LanguagePreferences({ userId }: LanguagePreferencesProps) {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const updateLanguagesMutation = useMutation({
    mutationFn: (spokenLanguages: string[]) =>
      apiRequest(`/api/users/${userId}`, 'PATCH', { spokenLanguages }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      setHasChanges(false);
      toast({
        title: "Languages Updated",
        description: "Your language preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update languages",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (user?.spokenLanguages) {
      setSelectedLanguages(user.spokenLanguages);
    }
  }, [user]);

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      const newLanguages = prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language];
      setHasChanges(true);
      return newLanguages;
    });
  };

  const handleSave = () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one language",
        variant: "destructive"
      });
      return;
    }
    updateLanguagesMutation.mutate(selectedLanguages);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language Preferences
        </CardTitle>
        <CardDescription>
          Select the languages you speak. Easy Eddy will only apply to jobs in these languages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LANGUAGE_OPTIONS.map((language) => (
              <div key={language.value} className="flex items-center space-x-2">
                <Checkbox
                  id={language.value}
                  checked={selectedLanguages.includes(language.value)}
                  onCheckedChange={() => handleLanguageToggle(language.value)}
                />
                <Label
                  htmlFor={language.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {language.label}
                </Label>
              </div>
            ))}
          </div>

          {selectedLanguages.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Selected Languages:</span>
              </div>
              <div className="mt-1 text-sm text-green-700">
                {selectedLanguages.map(lang => 
                  LANGUAGE_OPTIONS.find(l => l.value === lang)?.label
                ).join(', ')}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateLanguagesMutation.isPending || selectedLanguages.length === 0}
            >
              {updateLanguagesMutation.isPending ? 'Saving...' : 'Save Languages'}
            </Button>
            {hasChanges && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLanguages(user?.spokenLanguages || []);
                  setHasChanges(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Easy Eddy will analyze job postings to detect their language 
              and only apply to jobs in languages you speak. Make sure to upload CVs for each 
              language you select.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}