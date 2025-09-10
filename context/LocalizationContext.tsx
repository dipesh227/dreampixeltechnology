import React, { createContext, useState, useCallback, useEffect } from 'react';

interface LocalizationContextType {
    locale: string;
    changeLocale: (newLocale: string) => void;
    t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');
    const [translations, setTranslations] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTranslations = async () => {
            setIsLoading(true);
            try {
                // Paths are relative to the public root (index.html)
                const response = await fetch(`./locales/${locale}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load locale file for '${locale}'.`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error(error);
                // Fallback to English if the requested locale fails
                if (locale !== 'en') {
                    console.warn(`Falling back to 'en' locale.`);
                    setLocale('en');
                } else {
                    // if even english fails, there's a bigger issue.
                    setTranslations({}); 
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslations();
    }, [locale]);

    const changeLocale = useCallback((newLocale: string) => {
        if (['en', 'hi'].includes(newLocale) && newLocale !== locale) {
            setLocale(newLocale);
        }
    }, [locale]);

    const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
        if (isLoading || !translations) {
            return key; // Return key as a fallback during loading
        }
        
        const keys = key.split('.');
        let text = translations;
        try {
            for (const k of keys) {
                if (text === null || typeof text !== 'object' || text[k] === undefined) {
                    throw new Error(`Key '${k}' not found in path '${key}'`);
                }
                text = text[k];
            }
            if (typeof text !== 'string') {
                return key;
            }

            let replacedText = text;
            if (options) {
                Object.keys(options).forEach(optKey => {
                    const regex = new RegExp(`{{${optKey}}}`, 'g');
                    replacedText = replacedText.replace(regex, String(options[optKey]));
                });
            }
            return replacedText;
        } catch (error) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }, [translations, isLoading]);
    
    const value = {
        locale,
        changeLocale,
        t
    };

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};
