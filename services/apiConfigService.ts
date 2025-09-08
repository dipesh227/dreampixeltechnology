import React, { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import * as geminiNativeService from './geminiNativeService';

export interface ApiStatus {
    status: 'validating' | 'valid' | 'invalid' | 'custom_valid';
    error: string | null;
}

// A unique, stable key for SWR to cache our API status
export const API_STATUS_KEY = 'api_status_key';

let activeApiKey: string | null = null;
let siteApiKey: string | null = null;

// Initialize the site key from environment variables once.
try {
    siteApiKey = process.env.API_KEY || null;
} catch (e) {
    console.error("Failed to read API_KEY from environment.", e);
}

const getSiteApiKey = (): string => {
    if (!siteApiKey) {
        throw new Error("Default site API key is not configured.");
    }
    return siteApiKey;
};

export const getApiKey = (): string => {
    return activeApiKey || getSiteApiKey();
};

const validateKey = async (key: string | null): Promise<ApiStatus> => {
    const isCustom = !!key;
    const keyToValidate = key || siteApiKey;
    
    if (!keyToValidate) {
        return { status: 'invalid', error: 'No API key is configured.' };
    }
    
    try {
        const { isValid, error } = await geminiNativeService.validateApiKey(keyToValidate);
        if (isValid) {
            return { status: isCustom ? 'custom_valid' : 'valid', error: null };
        } else {
            return { status: 'invalid', error: error || 'The active API key is invalid.' };
        }
    } catch (error: any) {
        return { status: 'invalid', error: error.message };
    }
};

// This function will be called to update the global state
export const setActiveApiKey = (userKey: string | null) => {
    activeApiKey = userKey;
    // Trigger a revalidation in all components using the useApiStatus hook
    mutate(API_STATUS_KEY);
};

// --- SWR Integration ---
// We need access to mutate from useSWRConfig, so we define it here.
let mutate: (key: string) => void;

// A dummy component to initialize mutate
const MutateInitializer = () => {
    const swrConfig = useSWRConfig();
    mutate = swrConfig.mutate;
    return null;
};

// The hook components will use to get the current status
export const useApiStatus = (): ApiStatus => {
    const { data } = useSWR(API_STATUS_KEY, () => validateKey(activeApiKey), {
        revalidateOnFocus: false, // Prevent re-validating every time the window is focused
        revalidateOnReconnect: false,
    });

    return data || { status: 'validating', error: null };
};

// A provider component to wrap the app and initialize the mutate function
export const ApiStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize the API key to the site default on first load
    useEffect(() => {
        setActiveApiKey(null);
    }, []);

    // FIX: Replaced JSX with React.createElement to avoid compilation errors in a .ts file.
    return React.createElement(React.Fragment, null, 
        React.createElement(MutateInitializer), 
        children
    );
};
