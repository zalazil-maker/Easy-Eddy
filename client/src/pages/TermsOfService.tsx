import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-muted-foreground">
              <strong>Effective date:</strong> 27/07/2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Welcome to <strong>JobHackr</strong>. By using our AI-powered job application automation service, you agree to these terms.
            </p>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Service Description</h3>
                <p>
                  JobHackr provides automated job application services using AI technology to help users apply to positions across French job platforms including LinkedIn France, Indeed, Pôle Emploi, and others.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. User Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate and up-to-date CV and job preference information</li>
                  <li>Ensure all information uploaded is truthful and represents your qualifications</li>
                  <li>Monitor applications sent on your behalf and respond to employer contacts</li>
                  <li>Use the service in compliance with job platform terms and applicable laws</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Subscription Terms</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Free tier: 10 applications per week</li>
                  <li>Weekly Café En Terrasse: €2.20/week for 10 applications daily</li>
                  <li>Monthly Coca En Terrasse: €4.99/month for 10 applications daily</li>
                  <li>Premium King's/Queen's Career: €29.99/month for 30 applications daily</li>
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>Usage limits reset according to your subscription cycle</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. AI and Automation</h3>
                <p>
                  Our AI processes your data to generate cover letters, detect languages, and optimize applications. While we strive for accuracy, you remain responsible for all applications sent on your behalf.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Limitation of Liability</h3>
                <p>
                  JobHackr provides automation tools but cannot guarantee job interviews, offers, or employment outcomes. We are not responsible for employer responses or hiring decisions.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Cancellation and Refunds</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cancel anytime through your account settings</li>
                  <li>Cancellation takes effect at the end of your current billing cycle</li>
                  <li>No refunds for partial subscription periods</li>
                  <li>Unused applications do not carry over between billing cycles</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Account Termination</h3>
                <p>
                  We may suspend or terminate accounts that violate these terms, abuse the service, or engage in fraudulent activity.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. Changes to Service</h3>
                <p>
                  We reserve the right to modify features, pricing, or discontinue the service with reasonable notice to users.
                </p>
              </section>

              <section className="border-t pt-6">
                <p className="text-center">
                  Questions about these terms? Contact: <a href="mailto:merefuker@gmail.com" className="text-blue-600 hover:underline">merefuker@gmail.com</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}