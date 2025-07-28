import { useState, useEffect } from 'react';
import { 
  Download, 
  Brain, 
  FileText, 
  Languages, 
  Zap,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AIUsageStats {
  totalStats: {
    coverLetters: number;
    cvOptimizations: number;
    translations: number;
    languageDetections: number;
  };
  userStats: UserAIUsage[];
  dailyUsage: DailyUsage[];
}

interface UserAIUsage {
  userEmail: string;
  plan: 'weekly' | 'monthly' | 'premium';
  coverLetters: number;
  cvOptimizations: number;
  translations: number;
  languageDetections: number;
  total: number;
}

interface DailyUsage {
  date: string;
  coverLetters: number;
  cvOptimizations: number;
  translations: number;
  languageDetections: number;
}

export default function AdminAIUsage() {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<'overview' | 'users' | 'daily'>('overview');

  useEffect(() => {
    loadAIUsageStats();
  }, []);

  const loadAIUsageStats = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock AI usage data
    const mockStats: AIUsageStats = {
      totalStats: {
        coverLetters: 15420,
        cvOptimizations: 3280,
        translations: 8940,
        languageDetections: 22100
      },
      userStats: [
        {
          userEmail: 'marie.dupont@gmail.com',
          plan: 'weekly',
          coverLetters: 45,
          cvOptimizations: 0,
          translations: 23,
          languageDetections: 68,
          total: 136
        },
        {
          userEmail: 'jean.martin@hotmail.fr',
          plan: 'monthly',
          coverLetters: 78,
          cvOptimizations: 0,
          translations: 34,
          languageDetections: 112,
          total: 224
        },
        {
          userEmail: 'sophie.bernard@yahoo.fr',
          plan: 'premium',
          coverLetters: 156,
          cvOptimizations: 23,
          translations: 89,
          languageDetections: 245,
          total: 513
        },
        {
          userEmail: 'pierre.leroy@gmail.com',
          plan: 'weekly',
          coverLetters: 23,
          cvOptimizations: 0,
          translations: 12,
          languageDetections: 35,
          total: 70
        },
        {
          userEmail: 'alice.moreau@live.fr',
          plan: 'premium',
          coverLetters: 89,
          cvOptimizations: 12,
          translations: 45,
          languageDetections: 134,
          total: 280
        }
      ],
      dailyUsage: [
        { date: '2025-01-25', coverLetters: 248, cvOptimizations: 42, translations: 156, languageDetections: 389 },
        { date: '2025-01-24', coverLetters: 234, cvOptimizations: 38, translations: 142, languageDetections: 367 },
        { date: '2025-01-23', coverLetters: 267, cvOptimizations: 45, translations: 178, languageDetections: 423 },
        { date: '2025-01-22', coverLetters: 198, cvOptimizations: 29, translations: 134, languageDetections: 298 },
        { date: '2025-01-21', coverLetters: 289, cvOptimizations: 52, translations: 189, languageDetections: 445 },
        { date: '2025-01-20', coverLetters: 223, cvOptimizations: 35, translations: 145, languageDetections: 356 },
        { date: '2025-01-19', coverLetters: 256, cvOptimizations: 41, translations: 167, languageDetections: 398 }
      ]
    };
    
    setStats(mockStats);
    setIsLoading(false);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'weekly':
        return <Badge className="bg-blue-100 text-blue-700">Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-green-100 text-green-700">Monthly</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-700">Premium</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const exportToCSV = () => {
    if (!stats) return;

    const csvContent = [
      ['User Email', 'Plan', 'Cover Letters', 'CV Optimizations', 'Translations', 'Language Detections', 'Total'],
      ...stats.userStats.map(user => [
        user.userEmail,
        user.plan,
        user.coverLetters,
        user.cvOptimizations,
        user.translations,
        user.languageDetections,
        user.total
      ])
    ]
    .map(row => row.join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `ai-usage-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Usage Analytics</h1>
            <p className="text-gray-600">Track AI feature utilization across all users</p>
          </div>
          <div className="flex space-x-3">
            <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="users">By User</SelectItem>
                <SelectItem value="daily">Daily Trends</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cover Letters Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalStats.coverLetters.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Optimizations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalStats.cvOptimizations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Premium feature only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translations</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalStats.translations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              French ↔ English
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Language Detections</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalStats.languageDetections.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-detection accuracy: 97.3%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view type */}
      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Features Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features Usage Distribution</CardTitle>
              <CardDescription>Breakdown of AI feature utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Cover Letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Language Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '44%' }}></div>
                    </div>
                    <span className="text-sm font-medium">44%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Translations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">CV Optimizations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '7%' }}></div>
                    </div>
                    <span className="text-sm font-medium">7%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage by Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Subscription Plan</CardTitle>
              <CardDescription>AI feature usage across different plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Premium Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">793 operations</div>
                    <div className="text-sm text-gray-600">Including CV optimization</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Monthly Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">224 operations</div>
                    <div className="text-sm text-gray-600">Basic AI features</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Weekly Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">206 operations</div>
                    <div className="text-sm text-gray-600">Standard features</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Usage by User</CardTitle>
            <CardDescription>
              Detailed breakdown of AI feature usage per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Cover Letters</TableHead>
                  <TableHead>CV Optimizations</TableHead>
                  <TableHead>Translations</TableHead>
                  <TableHead>Language Detection</TableHead>
                  <TableHead>Total Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.userStats.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{user.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(user.plan)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.coverLetters}</div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${user.cvOptimizations > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                        {user.cvOptimizations || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.translations}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.languageDetections}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg">{user.total}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {viewType === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle>Daily AI Usage Trends</CardTitle>
            <CardDescription>
              AI feature usage over the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Cover Letters</TableHead>
                  <TableHead>CV Optimizations</TableHead>
                  <TableHead>Translations</TableHead>
                  <TableHead>Language Detection</TableHead>
                  <TableHead>Daily Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.dailyUsage.map((day, index) => {
                  const total = day.coverLetters + day.cvOptimizations + day.translations + day.languageDetections;
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{new Date(day.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600">{day.coverLetters}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-purple-600">{day.cvOptimizations}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">{day.translations}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-orange-600">{day.languageDetections}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg">{total}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}