import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, FileText, Download, Trash2, CheckCircle } from "lucide-react";
import type { UserCV } from "@shared/schema";

interface CVUploadProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export default function CVUpload({ data, onUpdate }: CVUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Get existing CVs
  const { data: userCVs, refetch: refetchCVs } = useQuery<UserCV[]>({
    queryKey: ["/api/users/1/cvs"],
    enabled: true,
  });

  const uploadCVMutation = useMutation({
    mutationFn: async ({ file, language }: { file: File, language: string }) => {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('language', language);
      
      const response = await fetch("/api/users/1/upload-cv", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setSelectedFile(null);
      setIsUploading(false);
      refetchCVs();
      onUpdate({ cvUploaded: true });
      toast({
        title: "CV Uploaded Successfully",
        description: `Your ${language === 'en' ? 'English' : 'French'} CV has been uploaded and processed.`,
      });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCVMutation = useMutation({
    mutationFn: async (cvId: number) => {
      const response = await apiRequest("DELETE", `/api/users/1/cvs/${cvId}`);
      return response.json();
    },
    onSuccess: () => {
      refetchCVs();
      toast({
        title: "CV Deleted",
        description: "CV has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadCVMutation.mutate({ file: selectedFile, language });
  };

  const handleDownload = async (cvId: number) => {
    try {
      const response = await fetch(`/api/users/1/cvs/${cvId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* CV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black flex items-center">
            <CloudUpload className="mr-2" size={20} />
            Upload Your CV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">CV Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="cv-upload">Choose PDF File</Label>
            <Input
              id="cv-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-800">{selectedFile.name}</p>
                  <p className="text-xs text-blue-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full bg-brand-green hover:bg-brand-green-dark"
          >
            {isUploading ? "Uploading..." : "Upload CV"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing CVs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">Your CVs</CardTitle>
        </CardHeader>
        <CardContent>
          {userCVs && userCVs.length > 0 ? (
            <div className="space-y-3">
              {userCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="text-green-600" size={20} />
                      <div>
                        <p className="font-medium text-black">
                          {cv.language.toUpperCase()} CV
                        </p>
                        <p className="text-sm text-gray-600">
                          {cv.fileName || 'Uploaded CV'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(cv.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {cv.filePath && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(cv.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCVMutation.mutate(cv.id)}
                        disabled={deleteCVMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No CVs uploaded yet. Upload your first CV above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">CV Upload Tips:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Upload high-quality PDF files for best text extraction</li>
                <li>• You can upload CVs in both English and French</li>
                <li>• CVs are sent as-is without modification</li>
                <li>• The system automatically matches CV language to job postings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
