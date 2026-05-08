import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;
const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

async function syncCustomerWithPortal(user: User) {
    try {
        await fetch(`${PORTAL_URL}/api/auth/customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                name: user.displayName ?? undefined,
                storeSlug: STORE_SLUG,
            }),
        });
    } catch (e) {
        console.error('Portal sync failed:', e);
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
            if (u) syncCustomerWithPortal(u);
        });
        return unsub;
    }, []);

    const loginWithEmail = async (email: string, password: string) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await syncCustomerWithPortal(cred.user);
    };

    const registerWithEmail = async (email: string, password: string, name: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await syncCustomerWithPortal(cred.user);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        await syncCustomerWithPortal(cred.user);
    };

    const logout = () => signOut(auth);

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