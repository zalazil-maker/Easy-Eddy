import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'english' | 'french';
  setLanguage: (lang: 'english' | 'french') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  english: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'JobHackr Dashboard',
    'dashboard.welcome': 'Welcome to JobHackr',
    'dashboard.subtitle': 'AI-powered job application automation for the French market',
    'dashboard.startSearch': 'Start Today\'s Job Search',
    'dashboard.applicationsToday': 'Applications Today',
    'dashboard.totalApplications': 'Total Applications',
    'dashboard.successRate': 'Success Rate',
    'dashboard.aiFeatures': 'AI Features',
    
    // Subscription tiers
    'subscription.free': 'Free',
    'subscription.weekly': 'Weekly Café En Terrasse',
    'subscription.monthly': 'Monthly Coca En Terrasse',
    'subscription.premium': 'King\'s/Queen\'s Career',
    'subscription.price.weekly': '€2.20/week',
    'subscription.price.monthly': '€4.99/month',
    'subscription.price.premium': '€29.99/month',
    
    // Features
    'features.languageDetection': 'Language Detection',
    'features.translation': 'Translation',
    'features.autoCoverLetter': 'Auto Cover Letters',
    'features.onDemandCoverLetter': 'On-demand Cover Letters',
    'features.cvOptimization': 'CV Optimization',
    
    // Buttons
    'button.upgrade': 'Upgrade Plan',
    'button.generateCoverLetter': 'Generate Cover Letter',
    'button.optimizeCV': 'Optimize CV',
    'button.translate': 'Translate',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    
    // Messages
    'message.upgradeRequired': 'This feature requires a paid subscription',
    'message.dailyLimitReached': 'Daily application limit reached',
    'message.success': 'Success!',
    'message.error': 'An error occurred',
  },
  french: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord JobHackr',
    'dashboard.welcome': 'Bienvenue sur JobHackr',
    'dashboard.subtitle': 'Automatisation de candidatures d\'emploi alimentée par l\'IA pour le marché français',
    'dashboard.startSearch': 'Commencer la recherche d\'emploi du jour',
    'dashboard.applicationsToday': 'Candidatures aujourd\'hui',
    'dashboard.totalApplications': 'Total des candidatures',
    'dashboard.successRate': 'Taux de réussite',
    'dashboard.aiFeatures': 'Fonctionnalités IA',
    
    // Subscription tiers
    'subscription.free': 'Gratuit',
    'subscription.weekly': 'Café En Terrasse Hebdomadaire',
    'subscription.monthly': 'Coca En Terrasse Mensuel',
    'subscription.premium': 'Carrière du Roi/de la Reine',
    'subscription.price.weekly': '2,20€/semaine',
    'subscription.price.monthly': '4,99€/mois',
    'subscription.price.premium': '29,99€/mois',
    
    // Features
    'features.languageDetection': 'Détection de langue',
    'features.translation': 'Traduction',
    'features.autoCoverLetter': 'Lettres de motivation automatiques',
    'features.onDemandCoverLetter': 'Lettres de motivation à la demande',
    'features.cvOptimization': 'Optimisation de CV',
    
    // Buttons
    'button.upgrade': 'Améliorer le plan',
    'button.generateCoverLetter': 'Générer une lettre de motivation',
    'button.optimizeCV': 'Optimiser le CV',
    'button.translate': 'Traduire',
    'button.save': 'Enregistrer',
    'button.cancel': 'Annuler',
    
    // Messages
    'message.upgradeRequired': 'Cette fonctionnalité nécessite un abonnement payant',
    'message.dailyLimitReached': 'Limite quotidienne de candidatures atteinte',
    'message.success': 'Succès !',
    'message.error': 'Une erreur s\'est produite',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'english' | 'french'>('english');

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem('jobhackr-language') as 'english' | 'french';
    if (savedLanguage && (savedLanguage === 'english' || savedLanguage === 'french')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'english' | 'french') => {
    setLanguageState(lang);
    localStorage.setItem('jobhackr-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.english] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}