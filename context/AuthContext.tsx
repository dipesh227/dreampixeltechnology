import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import useSWR from 'swr';

// FIX: Update type inference to be compatible with the Supabase v2 JS client.
// This correctly infers the Session and User types from the async `getSession` method.
type Session = NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>;
type User = Session['user'];

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
        setLoading(true);

        // FIX: Replaced outdated Supabase v1 methods with the correct v2 equivalents.
        // First, get the initial session state.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Then, set up a listener for future auth state changes.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // When the Supabase client detects a session from the URL after an OAuth redirect,
        // it creates the session, but the URL still contains the hash with tokens.
        // This effect runs when the session is set, and we can clean up the URL for a better UX.
        if (session && window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [session]);

    const login = async () => {
        setIsLoggingIn(true);
        setAuthError(null);
        try {
            // FIX: Replaced outdated signIn() with the correct v2 method, signInWithOAuth().
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
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
            // The signOut() method is correct for v2.
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};