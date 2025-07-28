import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, Target, Globe, Crown, Coffee } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SubscriptionLimits {
  subscription: {
    tier: string;
    status: string;
    isActive: boolean;
    expiresAt?: Date;
  };
  limits: {
    dailyApplications: number;
    remainingApplications: number;
    applicationsUsedToday: number;
  };
  features: {
    languageDetection: boolean;
    translation: boolean;
    autoCoverLetter: boolean;
    onDemandCoverLetter: boolean;
    cvOptimization: boolean;
  };
}

export default function JobHackrDashboard() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Mock user ID - in production this would come from auth context
  const userId = 1;
  
  // Demo setup - removed automatic signin

  useEffect(() => {
    loadSubscriptionLimits();
  }, []);

  const loadSubscriptionLimits = async () => {
    // For demo purposes, use mock data directly to avoid API routing issues
    console.log('Loading subscription limits for demo...');
    
    setLimits({
      success: true,
      subscription: {
        tier: 'weekly',
        status: 'active',
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      limits: {
        dailyApplications: 10,
        remainingApplications: 8,
        applicationsUsedToday: 2
      },
      features: {
        languageDetection: true,
        translation: true,
        autoCoverLetter: true,
        onDemandCoverLetter: false,
        cvOptimization: false
      }
    });
  };

  const startJobSearch = async () => {
    setIsSearching(true);
    
    // Simulate job search delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Mock successful job search results for demo
      const mockResults = {
        success: true,
        search: {
          totalJobsFound: 47,
          matchingJobs: 12,
          applicationsSubmitted: 5,
          duplicatesRemoved: 8
        },
        usage: {
          dailyLimit: 10,
          used: 7, // Updated count after search
          remaining: 3
        },
        subscription: {
          tier: 'weekly',
          aiFeatures: true
        },
        results: [
          { 
            job: "Développeur Full Stack", 
            company: "Capgemini", 
            location: "Paris", 
            matchScore: 87, 
            language: "french", 
            status: "applied", 
            coverLetterGenerated: true 
          },
          { 
            job: "Software Engineer", 
            company: "Accenture", 
            location: "Lyon", 
            matchScore: 82, 
            language: "english", 
            status: "applied", 
            coverLetterGenerated: true 
          },
          { 
            job: "Ingénieur DevOps", 
            company: "Thales", 
            location: "Toulouse", 
            matchScore: 78, 
            language: "french", 
            status: "applied", 
            coverLetterGenerated: true 
          }
        ],
        searchCompleted: new Date().toISOString()
      };
      
      setSearchResults(mockResults);
      toast({
        title: t('message.success'),
        description: `${mockResults.search.applicationsSubmitted} applications sent successfully!`,
      });
      
      // Update usage limits after search
      setLimits(prev => prev ? {
        ...prev,
        limits: {
          ...prev.limits,
          applicationsUsedToday: mockResults.usage.used,
          remainingApplications: mockResults.usage.remaining
        }
      } : null);
      
    } catch (error: any) {
      toast({
        title: t('message.error'),
        description: error.message || 'Job search failed',
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'weekly': return <Coffee className="h-4 w-4" />;
      case 'monthly': return <Coffee className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'weekly': return 'bg-blue-500';
      case 'monthly': return 'bg-green-500';
      case 'premium': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!limits) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
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
                <h1 className="text-2xl font-bold text-gray-900">JobHackr</h1>
                <p className="text-sm text-gray-600">{t('dashboard.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('english')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    language === 'english' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('french')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    language === 'french' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  FR
                </button>
              </div>
              
              {/* Subscription Badge */}
              <Badge className={`${getTierColor(limits.subscription.tier)} text-white`}>
                <div className="flex items-center space-x-1">
                  {getTierIcon(limits.subscription.tier)}
                  <span>{t(`subscription.${limits.subscription.tier}`)}</span>
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.welcome')}</h2>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.applicationsToday')}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{limits.limits.applicationsUsedToday}</div>
              <p className="text-xs text-muted-foreground">
                {limits.limits.remainingApplications} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{limits.limits.dailyApplications}</div>
              <p className="text-xs text-muted-foreground">
                {limits.subscription.tier} plan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🇫🇷 French Market</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30+</div>
              <p className="text-xs text-muted-foreground">Job sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.aiFeatures')}</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(limits.features).filter(Boolean).length}
              </div>
              <p className="text-xs text-muted-foreground">Active features</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Search Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>{t('dashboard.startSearch')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Search across 30+ French job websites with AI-powered matching and deduplication.
                </p>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Applications remaining today:</span>
                  <Badge variant="outline">{limits.limits.remainingApplications}</Badge>
                </div>
                
                <Button 
                  onClick={startJobSearch}
                  disabled={isSearching || limits.limits.remainingApplications === 0}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSearching ? (
                    <>
                      <Bot className="mr-2 h-4 w-4 animate-spin" />
                      Searching French job market...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      {t('dashboard.startSearch')}
                    </>
                  )}
                </Button>
                
                {limits.limits.remainingApplications === 0 && (
                  <p className="text-sm text-amber-600 text-center">
                    {t('message.dailyLimitReached')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span>{t('dashboard.aiFeatures')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('features.languageDetection')}</span>
                  <Badge variant={limits.features.languageDetection ? "default" : "secondary"}>
                    {limits.features.languageDetection ? "✓" : "✗"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('features.translation')}</span>
                  <Badge variant={limits.features.translation ? "default" : "secondary"}>
                    {limits.features.translation ? "✓" : "✗"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('features.autoCoverLetter')}</span>
                  <Badge variant={limits.features.autoCoverLetter ? "default" : "secondary"}>
                    {limits.features.autoCoverLetter ? "✓" : "✗"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('features.onDemandCoverLetter')}</span>
                  <Badge variant={limits.features.onDemandCoverLetter ? "default" : "secondary"}>
                    {limits.features.onDemandCoverLetter ? "✓" : "✗"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('features.cvOptimization')}</span>
                  <Badge variant={limits.features.cvOptimization ? "default" : "secondary"}>
                    {limits.features.cvOptimization ? "✓" : "✗"}
                  </Badge>
                </div>
                
                {limits.subscription.tier === 'free' && (
                  <Button className="w-full mt-4" variant="outline">
                    {t('button.upgrade')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchResults && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Latest Job Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {searchResults.search.applicationsSubmitted}
                    </div>
                    <div className="text-sm text-gray-600">Applications Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {searchResults.search.totalJobsFound}
                    </div>
                    <div className="text-sm text-gray-600">Jobs Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {searchResults.search.matchingJobs}
                    </div>
                    <div className="text-sm text-gray-600">Matches (70%+)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {searchResults.search.duplicatesRemoved}
                    </div>
                    <div className="text-sm text-gray-600">Duplicates Removed</div>
                  </div>
                </div>
                
                {searchResults.results.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Recent Applications:</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.results.slice(0, 5).map((result: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{result.job}</span>
                            <span className="text-gray-600 ml-2">at {result.company}</span>
                            {result.location && <span className="text-gray-500 ml-2">• {result.location}</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{result.matchScore}% match</Badge>
                            {result.coverLetterGenerated && (
                              <Badge className="bg-purple-100 text-purple-800">AI Letter</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}