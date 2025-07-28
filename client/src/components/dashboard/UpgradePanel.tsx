import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { User } from "@shared/schema";

interface UpgradePanelProps {
  user: User;
  onUpgrade: (planType: 'weekly' | 'monthly') => void;
}

export default function UpgradePanel({ user, onUpgrade }: UpgradePanelProps) {
  const isFreePlan = user.subscriptionType === "free";
  
  if (!isFreePlan) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-800">
              {user.subscriptionType === "weekly" ? "Weekly Pro" : "Monthly Pro"} Plan Active
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            You're enjoying premium features! 
            {user.subscriptionType === "weekly" 
              ? " 10 applications per day." 
              : " 15 applications per day."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">Upgrade Your Plan</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Currently: Free (10 apps/week)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-600">
          Unlock more job applications and boost your job search success!
        </p>
        
        {/* Plan Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Pro Plan */}
          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-orange-800">Weekly Pro</h3>
              <Badge className="bg-orange-600">Popular</Badge>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-bold text-orange-700">€2</span>
              <span className="text-orange-600">/week</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-orange-700">
                <Check className="h-4 w-4 mr-2 text-orange-600" />
                10 applications per day
              </li>
              <li className="flex items-center text-sm text-orange-700">
                <Check className="h-4 w-4 mr-2 text-orange-600" />
                70 applications per week
              </li>
              <li className="flex items-center text-sm text-orange-700">
                <Check className="h-4 w-4 mr-2 text-orange-600" />
                Priority job matching
              </li>
            </ul>
            <Button 
              onClick={() => onUpgrade('weekly')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Upgrade to Weekly Pro
            </Button>
          </div>

          {/* Monthly Pro Plan */}
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50 hover:bg-purple-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-800">Monthly Pro</h3>
              <Badge className="bg-purple-600">Best Value</Badge>
            </div>
            <div className="mb-3">
              <span className="text-2xl font-bold text-purple-700">€4.99</span>
              <span className="text-purple-600">/month</span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-sm text-purple-700">
                <Check className="h-4 w-4 mr-2 text-purple-600" />
                15 applications per day
              </li>
              <li className="flex items-center text-sm text-purple-700">
                <Check className="h-4 w-4 mr-2 text-purple-600" />
                450 applications per month
              </li>
              <li className="flex items-center text-sm text-purple-700">
                <Check className="h-4 w-4 mr-2 text-purple-600" />
                Premium job matching
              </li>
              <li className="flex items-center text-sm text-purple-700">
                <Check className="h-4 w-4 mr-2 text-purple-600" />
                Advanced analytics
              </li>
            </ul>
            <Button 
              onClick={() => onUpgrade('monthly')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Upgrade to Monthly Pro
            </Button>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">What you get with Pro:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Faster job applications
            </div>
            <div className="flex items-center text-gray-600">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Better job matching
            </div>
            <div className="flex items-center text-gray-600">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Priority support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}