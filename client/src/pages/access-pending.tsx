import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Clock, Mail } from "lucide-react";

export default function AccessPending() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="text-white" size={32} />
          </div>
          <CardTitle className="text-2xl font-bold text-black">Access Pending</CardTitle>
          <p className="text-sm text-gray-600">Your application is being reviewed</p>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-2">
              <Bot className="text-yellow-600 mr-2" size={20} />
              <span className="text-sm font-medium text-yellow-800">Account Under Review</span>
            </div>
            <p className="text-sm text-yellow-700">
              Thank you for signing up to Easy Eddy! Your account is currently being reviewed for approval.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-brand-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                We review all applications to ensure the best experience for our users
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-brand-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                You'll receive an email notification once your account is approved
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-brand-green rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                Approval typically takes 24-48 hours
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              <Mail className="mr-2" size={16} />
              Back to Homepage
            </Button>
          </div>

          <div className="text-xs text-gray-500 pt-2">
            Need help? Contact support at{" "}
            <a href="mailto:support@easyeddy.com" className="text-brand-green hover:underline">
              support@easyeddy.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}