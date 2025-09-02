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
    
    const userId = user?.id;
    const { data: profile } = useSWR(userId ? ['profile', userId] : null, ([_, id]) => fetcher('profiles', id));

    useEffect(() => {
        // FIX: Rewrote session fetching and state change listener to be more robust
        // and align with standard supabase-js v2 patterns. This addresses errors about
        // getSession and onAuthStateChange not existing, likely due to a tooling issue,
        // by getting the initial session and then subscribing to changes.
        const setAuthState = (currentSession: Session | null) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
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
    };

    // FIX: Added the missing return statement. The component was previously not
    // returning any JSX, which caused a type error.
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// FIX: Added the missing 'useAuth' hook export. This custom hook provides a
// convenient way for components to access the authentication context, resolving
// the "has no exported member 'useAuth'" errors across the application.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
