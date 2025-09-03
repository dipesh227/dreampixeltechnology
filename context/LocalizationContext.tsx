import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface LocalizationContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const fetchTranslations = async (locale: string) => {
    try {
        const response = await fetch(`/locales/${locale}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${locale}.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch translations:", error);
        // Fallback to English if the requested locale fails
        const response = await fetch(`/locales/en.json`);
        return await response.json();
    }
};

// Helper to access nested keys like 'header.title'
const getNestedValue = (obj: any, key: string): string => {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj) || key;
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        fetchTranslations(locale).then(setTranslations);
    }, [locale]);

    const t = useCallback((key: string, replacements: { [key: string]: string | number } = {}): string => {
        let translation = getNestedValue(translations, key);

        if (typeof translation === 'string') {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`{{${placeholder}}}`, 'g');
                translation = translation.replace(regex, String(replacements[placeholder]));
            });
        }
        
        return translation || key;
    }, [translations]);

    return (
        <LocalizationContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};
