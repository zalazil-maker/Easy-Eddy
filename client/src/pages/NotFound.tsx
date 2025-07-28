import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Bot className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-green-600 hover:bg-green-700"
        >
          <Bot className="mr-2 h-4 w-4" />
          Back to JobHackr
        </Button>
      </div>
    </div>
  );
}