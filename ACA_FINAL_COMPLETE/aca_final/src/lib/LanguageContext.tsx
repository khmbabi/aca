import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';
import { translateText } from '../services/aiService';

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', name: 'Afan Oromo', nativeName: 'Afaan Oromoo' },
  { code: 'ti', name: 'Tigrigna', nativeName: 'ትግርኛ' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: typeof languages;
  t: (key: string) => string;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  am: 'Amharic',
  om: 'Afan Oromo',
  ti: 'Tigrigna',
  sw: 'Swahili',
  it: 'Italian',
  ru: 'Russian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ar: 'Arabic'
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('translation_cache');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('translation_cache', JSON.stringify(cache));
  }, [cache]);

  const t = (key: string) => {
    const path = key.split('.');
    let value: any = translations[language];
    
    for (const part of path) {
      if (value && value[part]) {
        value = value[part];
      } else {
        value = null;
        break;
      }
    }

    if (value) return value as string;

    // Fallback to English
    let engValue: any = translations['en'];
    for (const part of path) {
      if (engValue && engValue[part]) {
        engValue = engValue[part];
      } else {
        engValue = null;
        break;
      }
    }

    return (engValue as string) || key;
  };

  const translate = async (text: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    
    const cacheKey = `${language}:${text}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    
    setIsTranslating(true);
    try {
      const result = await translateText(text, languageNames[language]);
      setCache(prev => ({ ...prev, [cacheKey]: result }));
      return result;
    } catch (error) {
      console.error("Translation error in context:", error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages, t, translate, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
