import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Upload, 
  Save, 
  X, 
  Camera,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  LogOut,
  Crown
} from "lucide-react";
import CVUploadModal from "./CVUploadModal";
import type { User as UserType } from "@shared/schema";

interface ProfileToggleProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileToggle({ user, isOpen, onClose }: ProfileToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    age: user.age?.toString() || "",
    gender: user.gender || "",
    location: user.location || "",
    currentJobTitle: user.currentJobTitle || "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: FormData) => {
      return await apiRequest({
        url: `/api/users/${user.id}/profile`,
        method: "PATCH",
        body: profileData,
        isFormData: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest({
        url: "/api/signout",
        method: "POST",
      });
    },
    onSuccess: () => {
      // Clear session storage
      sessionStorage.removeItem("easy_eddy_user_id");
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      // Navigate to home page
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  });

  // Get user subscription info
  const { data: userSubscription } = useQuery({
    queryKey: ["/api/users", user.id, "subscription"],
    enabled: isOpen,
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  const handleUpgradeToPro = () => {
    onClose();
    navigate("/subscription");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Cross-browser file size check
      const fileSize = file.size || 0;
      if (fileSize > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      // Cross-browser file type validation
      const fileType = file.type || '';
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(fileType.toLowerCase())) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Cross-browser FileReader implementation
      if (window.FileReader) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const result = e.target?.result;
          if (result && typeof result === 'string') {
            setProfileImage(result);
          }
        };
        reader.onerror = function() {
          toast({
            title: "Upload Error",
            description: "Failed to read the image file",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Browser Not Supported",
          description: "Your browser doesn't support image upload",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Error",
        description: "Something went wrong with the image upload",
        variant: "destructive",
      });
    }
  };

  const handleSave = function() {
    try {
      const formDataToSend = new FormData();
      
      // Add text fields with cross-browser compatibility
      Object.keys(formData).forEach(function(key) {
        const value = formData[key as keyof typeof formData];
        if (value && value.toString().trim() !== '') {
          formDataToSend.append(key, value.toString().trim());
        }
      });
      
      // Add profile image if selected
      if (selectedFile) {
        formDataToSend.append('profileImage', selectedFile, selectedFile.name);
      }

      updateProfileMutation.mutate(formDataToSend);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save profile changes",
        variant: "destructive",
      });
    }
  };

  const updateFormData = function(field: string, value: string) {
    try {
      setFormData(function(prev) {
        const newData = Object.assign({}, prev);
        newData[field as keyof typeof prev] = value;
        return newData;
      });
    } catch (error) {
      console.error('Form update error:', error);
    }
  };

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const getStatusBadge = () => {
    if (user.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        ⏳ Pending Approval
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-black">Profile Settings</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-brand-green flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-medium">
                      {getInitials(user.email, formData.fullName)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={function() {
                    try {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    } catch (error) {
                      console.warn('File input click failed:', error);
                    }
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                style={{ display: 'none' }}
              />
              <p className="text-sm text-gray-600 mt-2">Click camera icon to upload photo</p>
            </div>

            {/* Account Status */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Account Status</p>
              {getStatusBadge()}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="Age"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <Label htmlFor="currentJobTitle" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Current Job Title
                </Label>
                <Input
                  id="currentJobTitle"
                  value={formData.currentJobTitle}
                  onChange={(e) => updateFormData("currentJobTitle", e.target.value)}
                  placeholder="Your current position"
                />
              </div>
            </div>

            {/* Additional Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-gray-600">Nationality</Label>
                <Input
                  value={user.nationality || "Not specified"}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-600">Years of Experience</Label>
                <Input
                  value={user.yearsOfExperience ? `${user.yearsOfExperience} years` : "Not specified"}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-600">Education Level</Label>
                <Input
                  value={user.educationLevel || "Not specified"}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-600">Spoken Languages</Label>
                <Input
                  value={user.spokenLanguages && user.spokenLanguages.length > 0 ? user.spokenLanguages.join(", ") : "Not specified"}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-600">LinkedIn Profile</Label>
                <Input
                  value={user.linkedinProfile || "Not specified"}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label className="text-gray-600">Email Address (Read-only)</Label>
              <Input
                value={user.email}
                disabled
                className="bg-gray-50 text-gray-500"
              />
            </div>

            {/* Comprehensive CV Management Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-brand-green" />
                <h3 className="text-lg font-semibold">CV Management</h3>
              </div>
              
              <div className="space-y-4">
                {/* Current CV Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">Current CV Status</p>
                      <p className="text-xs text-gray-600">
                        {user.cvContent ? "CV uploaded and ready" : "No CV uploaded"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CVUploadModal 
                        userId={user.id}
                        triggerText={user.cvContent ? "Update CV" : "Upload CV"}
                        variant="outline"
                        size="sm"
                        className="text-brand-green border-brand-green hover:bg-brand-green hover:text-white"
                      />
                    </div>
                  </div>
                  
                  {user.cvContent && (
                    <div className="text-xs text-gray-500 mt-2">
                      <p>✓ CV optimization score: {user.cvOptimizationScore || 0}%</p>
                      <p>✓ Last updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}</p>
                    </div>
                  )}
                </div>

                {/* Multi-CV Management */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="text-sm font-medium text-blue-900">Multi-Language CV Support</h4>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Upload CVs in different languages to maximize your job application reach.
                  </p>
                  
                  <div className="space-y-2">
                    {user.spokenLanguages && user.spokenLanguages.length > 0 ? (
                      user.spokenLanguages.map((language, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{language}</span>
                            <span className="text-xs text-gray-500">
                              {user.cvContent ? "✓ CV Available" : "No CV"}
                            </span>
                          </div>
                          <CVUploadModal 
                            userId={user.id}
                            triggerText={user.cvContent ? "Update" : "Upload"}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-100 text-xs px-2 py-1"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-blue-600">
                        Set your spoken languages in account settings to enable multi-language CV uploads.
                      </div>
                    )}
                  </div>
                </div>

                {/* CV Upload Options */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-medium text-green-900">CV Upload Options</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <CVUploadModal 
                      userId={user.id}
                      triggerText="Re-upload CV"
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-100"
                    />
                    
                    <CVUploadModal 
                      userId={user.id}
                      triggerText="Update Current"
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-100"
                    />
                    
                    <CVUploadModal 
                      userId={user.id}
                      triggerText="Add Additional"
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-300 hover:bg-green-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Account Management</h3>
              </div>
              
              <div className="space-y-3">
                {/* Current Plan Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      <p className="text-xs text-gray-600">
                        {userSubscription?.planType === 'free' ? 'Free Plan - 10 apps/week' :
                         userSubscription?.planType === 'weekly' ? 'Weekly Pro - €2/week - 10 apps/day' :
                         userSubscription?.planType === 'monthly' ? 'Monthly Pro - €4.99/month - 15 apps/day' :
                         'Free Plan - 10 apps/week'}
                      </p>
                    </div>
                    {(!userSubscription || userSubscription.planType === 'free') && (
                      <Button
                        onClick={handleUpgradeToPro}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  disabled={signOutMutation.isPending}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  {signOutMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}