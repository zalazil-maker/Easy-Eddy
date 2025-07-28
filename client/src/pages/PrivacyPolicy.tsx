import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
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
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">
              <strong>Effective date:</strong> 27/07/2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              <strong>JobHackr</strong> ("we", "us", "our") provides an AI-powered job automation app helping users find and apply to jobs. We care about your privacy and explain here how we handle your data.
            </p>

            <div className="space-y-6">
              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  📌 1. Data we collect
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>CVs / cover letters you upload or generate</li>
                  <li>Job preferences & filters</li>
                  <li>Email address & login info</li>
                  <li>Payment data (handled securely by Stripe)</li>
                  <li>App usage data (e.g., number of applications sent, AI features used)</li>
                </ul>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  🧠 2. Why we use your data
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To apply to jobs on your behalf</li>
                  <li>To generate tailored cover letters</li>
                  <li>To detect language & translate your documents</li>
                  <li>To manage subscriptions & billing</li>
                  <li>To improve and secure our services</li>
                </ul>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  ⚙️ 3. AI Processing
                </h3>
                <p>
                  We process your CV & cover letter data through AI models to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Generate cover letters</li>
                  <li>Optimize your CV</li>
                  <li>Detect language & translate content</li>
                </ul>
                <p className="mt-2">
                  These processes are automated and happen only to help deliver the service you requested.
                </p>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  🔒 4. Data storage & security
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Data is stored securely on servers located in Europe</li>
                  <li>We use encryption, access controls, and secure protocols</li>
                  <li>Payment data is never stored on our servers (processed by Stripe)</li>
                </ul>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  ✉️ 5. User rights
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Request a copy of your data</li>
                  <li>Ask us to delete your data</li>
                  <li>Update or correct data</li>
                  <li>Withdraw consent anytime (some features may stop working)</li>
                </ul>
                <p className="mt-2">
                  To exercise your rights: contact us at <a href="mailto:merefuker@gmail.com" className="text-blue-600 hover:underline">merefuker@gmail.com</a>
                </p>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  📦 6. Data sharing
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We <strong>do NOT</strong> sell your data</li>
                  <li>We may share data with service providers (e.g., Stripe) strictly to run the service</li>
                </ul>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  ✅ 7. Consent
                </h3>
                <p>
                  By using JobHackr and uploading your CV or using AI features, you consent to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Us processing your data for job applications</li>
                  <li>Using AI to generate cover letters, translations & optimizations</li>
                </ul>
                <p className="mt-2">
                  You can withdraw consent anytime in your account settings.
                </p>
              </section>

              <section>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  📢 8. Updates
                </h3>
                <p>
                  We may update this policy. We'll notify you by email or in-app.
                </p>
              </section>

              <section className="border-t pt-6">
                <p className="text-center">
                  For any questions, contact: <a href="mailto:merefuker@gmail.com" className="text-blue-600 hover:underline">merefuker@gmail.com</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}