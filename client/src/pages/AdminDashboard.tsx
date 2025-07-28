import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Brain, 
  DollarSign, 
  TrendingUp, 
  Bot,
  Coffee,
  Crown,
  Activity,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalUsers: number;
  usersByPlan: {
    weekly: number;
    monthly: number;
    premium: number;
  };
  applications: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  aiUsage: {
    coverLetters: number;
    cvOptimizations: number;
    translations: number;
    languageDetections: number;
  };
  revenue: {
    total: number;
    mrr: number; // Monthly Recurring Revenue
    churn: number;
  };
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock comprehensive dashboard data
    setStats({
      totalUsers: 247,
      usersByPlan: {
        weekly: 89,   // €2.20/week subscribers
        monthly: 142, // €4.99/month subscribers  
        premium: 16   // €29.99/month subscribers
      },
      applications: {
        today: 1847,
        thisWeek: 12943,
        thisMonth: 48762,
        total: 186450
      },
      aiUsage: {
        coverLetters: 15420,
        cvOptimizations: 3280,
        translations: 8940,
        languageDetections: 22100
      },
      revenue: {
        total: 18650, // €18,650 total revenue
        mrr: 3240,    // €3,240 MRR
        churn: 4.2    // 4.2% monthly churn
      }
    });
    
    setIsLoading(false);
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JobHackr Admin</h1>
                <p className="text-sm text-gray-600">AI-Powered Job Automation Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Administrator
              </Badge>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active subscribers across all plans
              </p>
            </CardContent>
          </Card>

          {/* Applications Today */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications Today</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications.today.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          {/* AI Features Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Features Used</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.aiUsage.coverLetters + stats.aiUsage.cvOptimizations + stats.aiUsage.translations).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total AI operations this month
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{stats.revenue.mrr.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.revenue.churn}% churn rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Tiers Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="h-5 w-5 text-blue-500 mr-2" />
                Weekly Café En Terrasse
              </CardTitle>
              <CardDescription>€2.20/week subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.usersByPlan.weekly}</div>
              <p className="text-sm text-gray-600 mt-2">
                Revenue: €{(stats.usersByPlan.weekly * 2.20 * 4).toFixed(0)}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coffee className="h-5 w-5 text-green-500 mr-2" />
                Monthly Coca En Terrasse  
              </CardTitle>
              <CardDescription>€4.99/month subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.usersByPlan.monthly}</div>
              <p className="text-sm text-gray-600 mt-2">
                Revenue: €{(stats.usersByPlan.monthly * 4.99).toFixed(0)}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 text-purple-500 mr-2" />
                King's/Queen's Career
              </CardTitle>
              <CardDescription>€29.99/month subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.usersByPlan.premium}</div>
              <p className="text-sm text-gray-600 mt-2">
                Revenue: €{(stats.usersByPlan.premium * 29.99).toFixed(0)}/month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Metrics</CardTitle>
              <CardDescription>Job applications sent across all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today</span>
                <span className="font-semibold">{stats.applications.today.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold">{stats.applications.thisWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold">{stats.applications.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-sm font-medium text-gray-900">All Time</span>
                <span className="font-bold text-lg">{stats.applications.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Usage Breakdown</CardTitle>
              <CardDescription>AI features utilized this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cover Letters Generated</span>
                <span className="font-semibold">{stats.aiUsage.coverLetters.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CV Optimizations</span>
                <span className="font-semibold">{stats.aiUsage.cvOptimizations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Translations</span>
                <span className="font-semibold">{stats.aiUsage.translations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Language Detections</span>
                <span className="font-semibold">{stats.aiUsage.languageDetections.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Financial performance and subscription metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">€{stats.revenue.total.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">€{stats.revenue.mrr.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.revenue.churn}%</div>
                <p className="text-sm text-gray-600">Monthly Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}