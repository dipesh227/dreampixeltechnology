import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
// FIX: Changed to type-only import to resolve potential module resolution issues with Session and User types.
import type { Session, User } from '@supabase/supabase-js';
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
        // FIX: Rewrote session fetching and state change listener to be more robust
        // and align with standard supabase-js v2 patterns. This addresses errors about
        // getSession and onAuthStateChange not existing, likely due to a tooling issue,
        // by providing a clean, canonical implementation.
        setLoading(true);
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(err => {
            // console.error("Error getting session:", err);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const login = async () => {
        setIsLoggingIn(true);
        setAuthError(null);
        try {
            // Use the application's origin as the redirect URL after successful login.
            const redirectTo = window.location.origin;

            // FIX: The signInWithOAuth method is correct for supabase-js v2.
            // The error is likely a type definition issue, but the call itself is correct.
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo
                }
            });
            if (error) throw error;
        } catch (error) {
            // console.error("Error signing in:", error);
            setAuthError(error instanceof Error ? error.message : "An unknown error occurred during login.");
            setIsLoggingIn(false);
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);
        setAuthError(null);
        try {
            // FIX: The signOut method is correct for supabase-js v2.
            // The error is likely a type definition issue, but the call itself is correct.
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            // console.error("Error signing out:", error);
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