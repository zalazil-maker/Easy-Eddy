import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, FileText, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { UserCV, InsertUserCV } from '@shared/schema';

interface CVManagementProps {
  userId: number;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'sv', label: 'Swedish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'pl', label: 'Polish' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' }
];

export default function CVManagement({ userId }: CVManagementProps) {
  const { toast } = useToast();
  const [isAddingCV, setIsAddingCV] = useState(false);
  const [editingCV, setEditingCV] = useState<UserCV | null>(null);
  const [formData, setFormData] = useState({
    language: '',
    cvContent: '',
    coverLetterTemplate: ''
  });

  const { data: cvs, isLoading } = useQuery<UserCV[]>({
    queryKey: [`/api/users/${userId}/cvs`],
    enabled: !!userId,
  });

  const createCVMutation = useMutation({
    mutationFn: (data: InsertUserCV) => 
      apiRequest(`/api/users/${userId}/cvs`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/cvs`] });
      setIsAddingCV(false);
      setFormData({ language: '', cvContent: '', coverLetterTemplate: '' });
      toast({
        title: "CV Added",
        description: "Your CV has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add CV",
        variant: "destructive"
      });
    }
  });

  const updateCVMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserCV> }) =>
      apiRequest(`/api/users/${userId}/cvs/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/cvs`] });
      setEditingCV(null);
      setFormData({ language: '', cvContent: '', coverLetterTemplate: '' });
      toast({
        title: "CV Updated",
        description: "Your CV has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update CV",
        variant: "destructive"
      });
    }
  });

  const deleteCVMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/users/${userId}/cvs/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/cvs`] });
      toast({
        title: "CV Deleted",
        description: "Your CV has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete CV",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCV) {
      updateCVMutation.mutate({ id: editingCV.id, data: formData });
    } else {
      createCVMutation.mutate(formData);
    }
  };

  const handleEdit = (cv: UserCV) => {
    setEditingCV(cv);
    setFormData({
      language: cv.language,
      cvContent: cv.cvContent,
      coverLetterTemplate: cv.coverLetterTemplate || ''
    });
    setIsAddingCV(true);
  };

  const handleCancel = () => {
    setIsAddingCV(false);
    setEditingCV(null);
    setFormData({ language: '', cvContent: '', coverLetterTemplate: '' });
  };

  const getLanguageLabel = (code: string) => {
    return LANGUAGE_OPTIONS.find(option => option.value === code)?.label || code;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5" />
            CV Management
          </h2>
          <p className="text-sm text-gray-600">
            Upload CVs in different languages for automatic job matching
          </p>
        </div>
        {!isAddingCV && (
          <Button onClick={() => setIsAddingCV(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add CV
          </Button>
        )}
      </div>

      {isAddingCV && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCV ? 'Edit CV' : 'Add New CV'}</CardTitle>
            <CardDescription>
              Upload your CV and cover letter template for a specific language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cvContent">CV Content</Label>
                <Textarea
                  id="cvContent"
                  value={formData.cvContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvContent: e.target.value }))}
                  placeholder="Paste your CV content here..."
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="coverLetterTemplate">Cover Letter Template (Optional)</Label>
                <Textarea
                  id="coverLetterTemplate"
                  value={formData.coverLetterTemplate}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetterTemplate: e.target.value }))}
                  placeholder="Paste your cover letter template here..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createCVMutation.isPending || updateCVMutation.isPending}
                >
                  {editingCV ? 'Update CV' : 'Add CV'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {cvs?.map((cv) => (
          <Card key={cv.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {getLanguageLabel(cv.language)} CV
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(cv)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteCVMutation.mutate(cv.id)}
                    disabled={deleteCVMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Added {new Date(cv.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">CV Content:</Label>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {cv.cvContent.substring(0, 200)}...
                  </p>
                </div>
                {cv.coverLetterTemplate && (
                  <div>
                    <Label className="text-sm font-medium">Cover Letter Template:</Label>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {cv.coverLetterTemplate.substring(0, 150)}...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cvs?.length === 0 && !isAddingCV && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No CVs uploaded yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your CVs in different languages to enable automatic job matching
            </p>
            <Button onClick={() => setIsAddingCV(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First CV
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}