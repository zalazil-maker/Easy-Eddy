import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, CheckCircle } from "lucide-react";

export default function AccessPending() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full w-fit">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Access Pending</CardTitle>
          <CardDescription>
            Your JobHackr account is under review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Account Created</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your registration has been completed successfully
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Admin Review</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our team is reviewing your application for approval
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-medium">Notification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll receive an email once your account is approved
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What's next?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Account approval typically takes 24-48 hours</li>
              <li>• You'll get full access to job automation features</li>
              <li>• Start with our free tier or choose a premium plan</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Check Status
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Questions? Contact us at{" "}
              <a href="mailto:merefuker@gmail.com" className="text-green-600 hover:underline">
                merefuker@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}