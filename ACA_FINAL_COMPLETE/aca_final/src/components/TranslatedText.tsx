import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';

interface TranslatedTextProps {
  children: any;
  as?: React.ElementType;
  className?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ children, as: Component = 'span', className }) => {
  const { language, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(typeof children === 'string' ? children : '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performTranslation = async () => {
      const textToTranslate = typeof children === 'string' ? children : String(children || '');
      
      if (language === 'en' || !textToTranslate) {
        setTranslatedText(textToTranslate);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translate(textToTranslate);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error("Failed to translate:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
  }, [children, language, translate]);

  return (
    <Component className={className}>
      {isLoading ? (
        <span className="animate-pulse opacity-50">{translatedText}</span>
      ) : (
        translatedText
      )}
    </Component>
  );
};

export default TranslatedText;
