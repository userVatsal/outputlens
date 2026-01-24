import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en-US' | 'en-GB';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number, currency: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'en-US': {
    analyze: 'Analyze',
    portfolio: 'Portfolio',
    methodology: 'Methodology',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    getStarted: 'Get Started',
    market: 'Market',
    assetName: 'Asset Name',
    tradeDirection: 'Trade Direction',
    entryPrice: 'Entry Price',
    tradeDate: 'Trade Date',
    timeHorizon: 'Time Horizon',
    evaluateTrade: 'Evaluate Trade',
    analyzing: 'Analyzing...',
    long: 'Long',
    short: 'Short',
    tradingHours: 'Trading Hours',
    currency: 'Currency',
    centralBank: 'Central Bank',
    disclaimer: 'This tool provides scenario analysis only. Not financial advice.',
    selectDate: 'Select trade date',
    color: 'Color',
    favorite: 'Favorite',
    analyze_trade: 'Analyze',
  },
  'en-GB': {
    analyze: 'Analyse',
    portfolio: 'Portfolio',
    methodology: 'Methodology',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    getStarted: 'Get Started',
    market: 'Market',
    assetName: 'Asset Name',
    tradeDirection: 'Trade Direction',
    entryPrice: 'Entry Price',
    tradeDate: 'Trade Date',
    timeHorizon: 'Time Horizon',
    evaluateTrade: 'Evaluate Trade',
    analyzing: 'Analysing...',
    long: 'Long',
    short: 'Short',
    tradingHours: 'Trading Hours',
    currency: 'Currency',
    centralBank: 'Central Bank',
    disclaimer: 'This tool provides scenario analysis only. Not financial advice.',
    selectDate: 'Select trade date',
    color: 'Colour',
    favorite: 'Favourite',
    analyze_trade: 'Analyse',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en-US';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const formatDate = (date: Date): string => {
    if (language === 'en-GB') {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const locale = language === 'en-GB' ? 'en-GB' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
