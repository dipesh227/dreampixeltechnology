import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import useSWR from 'swr';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
}

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetcher = async (url: string, userId: string) => {
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
    
    const userId = user?.id;
    const { data: profile } = useSWR(userId ? ['profile', userId] : null, ([_, id]) => fetcher('profiles', id));

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };
        
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async () => {
        setIsLoggingIn(true);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://ftsvupbnmvphphvwzxha.supabase.co/auth/v1/callback'
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in:", error);
            setAuthError(error instanceof Error ? error.message : "An unknown error occurred during login.");
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Error signing out:", error);
            setAuthError(error instanceof Error ? error.message : "An unknown error occurred during logout.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const value = {
        session,
        user,
        profile: profile || null,
        login,
        logout,
        loading,
        isLoggingIn,
        isLoggingOut,
        authError,
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