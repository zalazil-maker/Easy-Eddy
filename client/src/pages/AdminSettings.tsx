import { useState, useEffect } from 'react';
import { 
  Save, 
  Settings, 
  Sliders, 
  FileText, 
  Brain, 
  Languages,
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  subscriptionLimits: {
    weekly: { dailyApplications: number; aiFeatures: boolean };
    monthly: { dailyApplications: number; aiFeatures: boolean };
    premium: { dailyApplications: number; aiFeatures: boolean };
  };
  aiPrompts: {
    coverLetterTemplate: string;
    cvOptimizationPrompt: string;
    translationPrompt: string;
  };
  aiFeatures: {
    languageDetection: boolean;
    translation: boolean;
    coverLetterGeneration: boolean;
    cvOptimization: boolean;
  };
  systemSettings: {
    maxConcurrentUsers: number;
    jobSearchTimeout: number;
    duplicateCheckEnabled: boolean;
    emailNotifications: boolean;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock system settings
    const mockSettings: SystemSettings = {
      subscriptionLimits: {
        weekly: { dailyApplications: 10, aiFeatures: true },
        monthly: { dailyApplications: 10, aiFeatures: true },
        premium: { dailyApplications: 30, aiFeatures: true }
      },
      aiPrompts: {
        coverLetterTemplate: `Génère une lettre de motivation professionnelle en français pour le poste de {job_title} chez {company}. 

Utilise les informations suivantes:
- Nom: {user_name}
- Expérience: {experience}
- Compétences: {skills}

La lettre doit être:
- Personnalisée pour l'entreprise et le poste
- Professionnelle et engageante
- Maximum 250 mots
- Adaptée au marché français`,

        cvOptimizationPrompt: `Optimise ce CV pour le poste de {job_title}:

CV actuel: {cv_content}
Description du poste: {job_description}

Suggestions d'amélioration:
1. Mots-clés manquants
2. Compétences à mettre en avant
3. Expériences à reformuler
4. Structure à améliorer

Retourne uniquement les suggestions concrètes.`,

        translationPrompt: `Traduis ce texte de {source_language} vers {target_language} en gardant le contexte professionnel:

Texte: {text}

La traduction doit être:
- Naturelle et fluide
- Adaptée au contexte RH/recrutement
- Professionnelle`
      },
      aiFeatures: {
        languageDetection: true,
        translation: true,
        coverLetterGeneration: true,
        cvOptimization: true
      },
      systemSettings: {
        maxConcurrentUsers: 100,
        jobSearchTimeout: 300,
        duplicateCheckEnabled: true,
        emailNotifications: true
      }
    };
    
    setSettings(mockSettings);
    setIsLoading(false);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated successfully",
    });
    
    setIsSaving(false);
  };

  const updateSubscriptionLimit = (plan: keyof SystemSettings['subscriptionLimits'], field: string, value: number | boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      subscriptionLimits: {
        ...settings.subscriptionLimits,
        [plan]: {
          ...settings.subscriptionLimits[plan],
          [field]: value
        }
      }
    });
  };

  const updateAIPrompt = (promptType: keyof SystemSettings['aiPrompts'], value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      aiPrompts: {
        ...settings.aiPrompts,
        [promptType]: value
      }
    });
  };

  const toggleAIFeature = (feature: keyof SystemSettings['aiFeatures']) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      aiFeatures: {
        ...settings.aiFeatures,
        [feature]: !settings.aiFeatures[feature]
      }
    });
  };

  const updateSystemSetting = (setting: keyof SystemSettings['systemSettings'], value: number | boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      systemSettings: {
        ...settings.systemSettings,
        [setting]: value
      }
    });
  };

  if (isLoading || !settings) {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure JobHackr platform settings and AI features</p>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Subscription Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sliders className="h-5 w-5 mr-2" />
              Subscription Limits
            </CardTitle>
            <CardDescription>
              Configure daily application limits and AI feature access for each plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Plan */}
            <div>
              <h4 className="font-medium mb-3 text-blue-700">Weekly Café En Terrasse (€2.20/week)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekly-limit">Daily Applications Limit</Label>
                  <Input
                    id="weekly-limit"
                    type="number"
                    value={settings.subscriptionLimits.weekly.dailyApplications}
                    onChange={(e) => updateSubscriptionLimit('weekly', 'dailyApplications', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={settings.subscriptionLimits.weekly.aiFeatures}
                    onCheckedChange={(checked) => updateSubscriptionLimit('weekly', 'aiFeatures', checked)}
                  />
                  <Label>AI Features Enabled</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Monthly Plan */}
            <div>
              <h4 className="font-medium mb-3 text-green-700">Monthly Coca En Terrasse (€4.99/month)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly-limit">Daily Applications Limit</Label>
                  <Input
                    id="monthly-limit"
                    type="number"
                    value={settings.subscriptionLimits.monthly.dailyApplications}
                    onChange={(e) => updateSubscriptionLimit('monthly', 'dailyApplications', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={settings.subscriptionLimits.monthly.aiFeatures}
                    onCheckedChange={(checked) => updateSubscriptionLimit('monthly', 'aiFeatures', checked)}
                  />
                  <Label>AI Features Enabled</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Premium Plan */}
            <div>
              <h4 className="font-medium mb-3 text-purple-700">King's/Queen's Career (€29.99/month)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="premium-limit">Daily Applications Limit</Label>
                  <Input
                    id="premium-limit"
                    type="number"
                    value={settings.subscriptionLimits.premium.dailyApplications}
                    onChange={(e) => updateSubscriptionLimit('premium', 'dailyApplications', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={settings.subscriptionLimits.premium.aiFeatures}
                    onCheckedChange={(checked) => updateSubscriptionLimit('premium', 'aiFeatures', checked)}
                  />
                  <Label>AI Features Enabled</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Features Control
            </CardTitle>
            <CardDescription>
              Enable or disable AI features system-wide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Language Detection</div>
                    <div className="text-sm text-gray-600">Auto-detect job posting language</div>
                  </div>
                </div>
                <Switch
                  checked={settings.aiFeatures.languageDetection}
                  onCheckedChange={() => toggleAIFeature('languageDetection')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Languages className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Translation</div>
                    <div className="text-sm text-gray-600">French ↔ English translation</div>
                  </div>
                </div>
                <Switch
                  checked={settings.aiFeatures.translation}
                  onCheckedChange={() => toggleAIFeature('translation')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Cover Letter Generation</div>
                    <div className="text-sm text-gray-600">Auto-generate cover letters</div>
                  </div>
                </div>
                <Switch
                  checked={settings.aiFeatures.coverLetterGeneration}
                  onCheckedChange={() => toggleAIFeature('coverLetterGeneration')}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">CV Optimization</div>
                    <div className="text-sm text-gray-600">AI-powered CV improvements</div>
                  </div>
                </div>
                <Switch
                  checked={settings.aiFeatures.cvOptimization}
                  onCheckedChange={() => toggleAIFeature('cvOptimization')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Prompt Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              AI Prompt Templates
            </CardTitle>
            <CardDescription>
              Customize AI prompts for better output quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="cover-letter-prompt">Cover Letter Generation Prompt</Label>
              <Textarea
                id="cover-letter-prompt"
                rows={8}
                value={settings.aiPrompts.coverLetterTemplate}
                onChange={(e) => updateAIPrompt('coverLetterTemplate', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-2">
                Available variables: {'{job_title}'}, {'{company}'}, {'{user_name}'}, {'{experience}'}, {'{skills}'}
              </p>
            </div>

            <div>
              <Label htmlFor="cv-optimization-prompt">CV Optimization Prompt</Label>
              <Textarea
                id="cv-optimization-prompt"
                rows={6}
                value={settings.aiPrompts.cvOptimizationPrompt}
                onChange={(e) => updateAIPrompt('cvOptimizationPrompt', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-2">
                Available variables: {'{job_title}'}, {'{cv_content}'}, {'{job_description}'}
              </p>
            </div>

            <div>
              <Label htmlFor="translation-prompt">Translation Prompt</Label>
              <Textarea
                id="translation-prompt"
                rows={4}
                value={settings.aiPrompts.translationPrompt}
                onChange={(e) => updateAIPrompt('translationPrompt', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-2">
                Available variables: {'{source_language}'}, {'{target_language}'}, {'{text}'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Configuration
            </CardTitle>
            <CardDescription>
              General system settings and operational limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="max-users">Max Concurrent Users</Label>
                <Input
                  id="max-users"
                  type="number"
                  value={settings.systemSettings.maxConcurrentUsers}
                  onChange={(e) => updateSystemSetting('maxConcurrentUsers', parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="job-timeout">Job Search Timeout (seconds)</Label>
                <Input
                  id="job-timeout"
                  type="number"
                  value={settings.systemSettings.jobSearchTimeout}
                  onChange={(e) => updateSystemSetting('jobSearchTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.systemSettings.duplicateCheckEnabled}
                  onCheckedChange={(checked) => updateSystemSetting('duplicateCheckEnabled', checked)}
                />
                <Label>Enable Duplicate Job Detection</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.systemSettings.emailNotifications}
                  onCheckedChange={(checked) => updateSystemSetting('emailNotifications', checked)}
                />
                <Label>Enable Email Notifications</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}