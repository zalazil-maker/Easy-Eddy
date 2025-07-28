import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { insertUserSchema } from "@shared/schema";


const contactInfoSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface ContactInfoProps {
  data: any;
  onUpdate: (updates: any) => void;
}

export default function ContactInfo({ data, onUpdate }: ContactInfoProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: data.email || "",
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
      phone: data.phone || "",
      linkedinProfile: data.linkedinProfile || "",
      privacyPolicyAccepted: data.privacyPolicyAccepted || false,
      age: data.age || "",
      gender: data.gender || "",
      location: data.location || "",
      nationality: data.nationality || "",
      currentJobTitle: data.currentJobTitle || "",
      yearsOfExperience: data.yearsOfExperience || "",
      educationLevel: data.educationLevel || "",
      spokenLanguages: data.spokenLanguages || ["en"],
    },
  });

  const handleInputChange = (field: string, value: any) => {
    console.log(`ContactInfo: Updating ${field} with value:`, value);
    console.log("ContactInfo: Current data before update:", data);
    form.setValue(field as any, value);
    onUpdate({ [field]: value });
    console.log("ContactInfo: onUpdate called with:", { [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="john.doe@email.com"
          className="mt-1"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600 mt-1">{String(form.formState.errors.email.message || 'Invalid email')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password *
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={data.password || ""}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter your password"
            className="mt-1 pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-600 mt-1">{String(form.formState.errors.password.message || 'Invalid password')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password *
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={data.confirmPassword || ""}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            placeholder="Confirm your password"
            className="mt-1 pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">{String(form.formState.errors.confirmPassword.message || 'Passwords must match')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone Number *
        </Label>
        <Input
          id="phone"
          type="tel"
          required
          value={data.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="mt-1"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-red-600 mt-1">{String(form.formState.errors.phone.message || 'Invalid phone number')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">
          LinkedIn Profile (Optional)
        </Label>
        <Input
          id="linkedin"
          type="url"
          value={data.linkedinProfile}
          onChange={(e) => handleInputChange("linkedinProfile", e.target.value)}
          placeholder="https://linkedin.com/in/yourprofile"
          className="mt-1"
        />
      </div>

      {/* Demographics Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age" className="text-sm font-medium text-gray-700">
              Age (Optional)
            </Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={data.age}
              onChange={(e) => handleInputChange("age", parseInt(e.target.value) || null)}
              placeholder="25"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
              Gender (Optional)
            </Label>
            <Select value={data.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Current Location
            </Label>
            <Input
              id="location"
              type="text"
              value={data.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="New York, NY"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">
              Nationality (Optional)
            </Label>
            <Input
              id="nationality"
              type="text"
              value={data.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              placeholder="American"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Background</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentJobTitle" className="text-sm font-medium text-gray-700">
              Current Job Title (Optional)
            </Label>
            <Input
              id="currentJobTitle"
              type="text"
              value={data.currentJobTitle}
              onChange={(e) => handleInputChange("currentJobTitle", e.target.value)}
              placeholder="Software Engineer"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700">
              Years of Experience
            </Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              value={data.yearsOfExperience}
              onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || null)}
              placeholder="3"
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="educationLevel" className="text-sm font-medium text-gray-700">
              Education Level
            </Label>
            <Select value={data.educationLevel} onValueChange={(value) => handleInputChange("educationLevel", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={data.privacyPolicyAccepted || false}
              onCheckedChange={(checked) => {
                console.log("Privacy checkbox changed:", checked);
                handleInputChange("privacyPolicyAccepted", checked);
              }}
              className="mt-1"
            />
            <Label htmlFor="privacy" className="text-sm text-gray-700 leading-5">
              I agree to the{" "}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </a>
              {" "}and{" "}
              <a 
                href="/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms of Service
              </a>
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
