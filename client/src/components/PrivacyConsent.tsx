import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

interface PrivacyConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function PrivacyConsent({ checked, onChange, className = "" }: PrivacyConsentProps) {
  const [, setLocation] = useLocation();

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/privacy-policy', '_blank');
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/terms-of-service', '_blank');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id="privacy-consent"
          checked={checked}
          onCheckedChange={onChange}
          className="mt-1"
        />
        <Label htmlFor="privacy-consent" className="text-sm leading-5 cursor-pointer">
          I agree to the{" "}
          <button
            type="button"
            onClick={handlePrivacyClick}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Privacy Policy
          </button>
          {" "}and{" "}
          <button
            type="button"
            onClick={handleTermsClick}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Terms of Service
          </button>
        </Label>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={handlePrivacyClick}
          className="text-xs text-muted-foreground hover:text-blue-600 underline"
        >
          Read full Privacy Policy & Terms
        </button>
      </div>
    </div>
  );
}