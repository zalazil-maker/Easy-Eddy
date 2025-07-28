import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  X, 
  Loader2,
  Download,
  Plus
} from "lucide-react";
import type { User } from "@shared/schema";

interface CVUploadModalProps {
  userId: number;
  triggerText?: string;
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function CVUploadModal({ 
  userId, 
  triggerText = "Upload CV", 
  variant = "default",
  size = "default",
  className = ""
}: CVUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [coverLetter, setCoverLetter] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Get user's existing CVs
  const { data: userCVs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["/api/users", userId, "cvs"],
    enabled: isOpen,
  });

  // Upload CV mutation
  const uploadCVMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append("cv", selectedFile);
      formData.append("language", language);
      formData.append("coverLetterTemplate", coverLetter);
      
      return await apiRequest({
        url: `/api/users/${userId}/upload-cv`,
        method: "POST",
        body: formData,
        isFormData: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "CV Uploaded Successfully",
        description: `Your ${language === 'en' ? 'English' : 'French'} CV has been uploaded and processed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload CV. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete CV mutation
  const deleteCVMutation = useMutation({
    mutationFn: async (cvId: number) => {
      return await apiRequest({
        url: `/api/users/${userId}/cvs/${cvId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "CV Deleted",
        description: "CV has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "cvs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete CV.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSelectedFile(null);
    setLanguage("en");
    setCoverLetter("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Upload className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing CVs */}
          {!cvsLoading && userCVs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Current CVs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCVs.map((cv: any) => (
                    <div key={cv.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            {cv.language === 'en' ? 'English' : 'French'} CV
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCVMutation.mutate(cv.id)}
                          disabled={deleteCVMutation.isPending}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600">
                        Uploaded: {new Date(cv.createdAt).toLocaleDateString()}
                      </div>
                      {cv.filename && (
                        <div className="text-sm text-gray-500">
                          File: {cv.filename}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload New CV */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload New CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? "border-brand-green bg-green-50" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-8 w-8 text-green-600" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop your PDF CV here, or click to browse
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language">CV Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cover Letter Template */}
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter Template (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Enter a cover letter template for this CV..."
                  rows={4}
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={() => uploadCVMutation.mutate()}
                disabled={!selectedFile || uploadCVMutation.isPending}
                className="w-full"
              >
                {uploadCVMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}