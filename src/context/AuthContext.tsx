import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// The shape exposed to the rest of the app is identical to before.
// Components that used user.email / user.displayName continue to work.
// ---------------------------------------------------------------------------
interface AuthUser {
    email: string;
    displayName: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL as string;
const STORE_SLUG = import.meta.env.VITE_STORE_SLUG as string;

// ---------------------------------------------------------------------------
// Sync the logged-in customer to Owner-portal so they appear in the
// Customers tab immediately on first login.
// ---------------------------------------------------------------------------
async function syncCustomerWithPortal(email: string, name?: string | null) {
    try {
        await fetch(`${PORTAL_URL}/api/auth/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                name: name ?? undefined,
                storeSlug: STORE_SLUG,
            }),
        });
    } catch (e) {
        console.error('Portal sync failed:', e);
    }
}

// ---------------------------------------------------------------------------
// Map a Supabase session/user to our simple AuthUser shape
// ---------------------------------------------------------------------------
function toAuthUser(supabaseUser: User): AuthUser {
    return {
        email: supabaseUser.email!,
        // Google puts the name in user_metadata.full_name
        // Email signup stores it in user_metadata.display_name (we set it on register)
        displayName:
            supabaseUser.user_metadata?.full_name ??
            supabaseUser.user_metadata?.display_name ??
            null,
    };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On mount, check if there's already a session in localStorage
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                const u = toAuthUser(session.user);
                setUser(u);
                syncCustomerWithPortal(u.email, u.displayName);
            }
            setLoading(false);
        });

        // Subscribe to auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session?.user) {
                    const u = toAuthUser(session.user);
                    setUser(u);
                    // Sync on every fresh login event (not on token refresh)
                    if (_event === 'SIGNED_IN') {
                        syncCustomerWithPortal(u.email, u.displayName);
                    }
                } else {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // -------------------------------------------------------------------------
    // Auth methods
    // -------------------------------------------------------------------------
    const loginWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
    };

    const registerWithEmail = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: name },
            },
        });
        if (error) throw new Error(error.message);
    };

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // After Google redirects back, Supabase restores the session
                // automatically — no extra work needed.
                redirectTo: window.location.origin,
            },
        });
        if (error) throw new Error(error.message);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};