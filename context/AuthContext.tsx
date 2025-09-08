import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import useSWR from 'swr';
import * as userSettingsService from '../services/userSettingsService';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
}

type CustomApiKeyStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    isLoggingIn: boolean;
    isLoggingOut: boolean;
    authError: string | null;
    customApiKey: string | null;
    customApiKeyStatus: CustomApiKeyStatus;
    fetchCustomApiKey: () => Promise<void>;
    setCustomApiKey: (apiKey: string) => Promise<void>;
    clearCustomApiKey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = async (url: string, userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    
    const [customApiKey, _setCustomApiKey] = useState<string | null>(null);
    const [customApiKeyStatus, setCustomApiKeyStatus] = useState<CustomApiKeyStatus>('idle');
    
    const userId = user?.id;
    const { data: profile } = useSWR(userId ? ['profile', userId] : null, ([_, id]) => fetcher('profiles', id));

    const fetchCustomApiKey = useCallback(async () => {
        if (!userId) return;
        setCustomApiKeyStatus('validating');
        try {
            const key = await userSettingsService.getUserGeminiKey(userId);
            _setCustomApiKey(key);
            setCustomApiKeyStatus(key ? 'valid' : 'idle');
        } catch (error) {
            console.error("Error fetching custom API key:", error);
            _setCustomApiKey(null);
            setCustomApiKeyStatus('invalid');
        }
    }, [userId]);

    const setCustomApiKey = useCallback(async (apiKey: string) => {
        if (!userId) return;
        setCustomApiKeyStatus('validating');
        await userSettingsService.setUserGeminiKey(userId, apiKey);
        _setCustomApiKey(apiKey);
        setCustomApiKeyStatus('valid');
    }, [userId]);
    
    const clearCustomApiKey = useCallback(async () => {
        if (!userId) return;
        await userSettingsService.setUserGeminiKey(userId, ''); // Set to empty string
        _setCustomApiKey(null);
        setCustomApiKeyStatus('idle');
    }, [userId]);

    useEffect(() => {
        const setAuthState = (currentSession: Session | null) => {
            setSession(currentSession);
            const currentUser = currentSession?.user ?? null;
            setUser(currentUser);
            if (!currentUser) {
                // User logged out, clear custom key state
                _setCustomApiKey(null);
                setCustomApiKeyStatus('idle');
            }
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthState(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthState(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const login = async () => {
        setIsLoggingIn(true);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setAuthError(error.message || 'An unknown error occurred during login.');
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);
        setAuthError(null);
        try {
            await supabase.auth.signOut();
        } catch (error: any) {
            setAuthError(error.message || 'An unknown error occurred during logout.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const value: AuthContextType = {
        session,
        user,
        profile: profile || null,
        login,
        logout,
        loading,
        isLoggingIn,
        isLoggingOut,
        authError,
        customApiKey,
        customApiKeyStatus,
        fetchCustomApiKey,
        setCustomApiKey,
        clearCustomApiKey,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};