import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
    onClose: () => void;
    onSuccess?: () => void;
}

export const AuthModal: React.FC<Props> = ({ onClose, onSuccess }) => {
    const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = async () => {
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await loginWithEmail(email, password);
            } else {
                if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
                await registerWithEmail(email, password, name);
            }
            onSuccess?.();
            onClose();
        } catch (e: any) {
            setError(e.message?.replace('Firebase: ', '') ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            onSuccess?.();
            onClose();
        } catch (e: any) {
            setError(e.message?.replace('Firebase: ', '') ?? 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-black/70 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-brand-ivory w-full max-w-md border-4 border-brand-black shadow-[16px_16px_0px_#FF0080] p-10 relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 bg-brand-black text-white p-2">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-4xl font-display font-black italic mb-2">
                    {mode === 'login' ? 'Welcome Back.' : 'Join Dhanak.'}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-8">
                    {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
                </p>

                <div className="space-y-4">
                    {mode === 'register' && (
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border-2 border-brand-black p-4 font-bold focus:outline-none focus:border-brand-magenta"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border-2 border-brand-black p-4 font-bold focus:outline-none focus:border-brand-magenta"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border-2 border-brand-black p-4 font-bold focus:outline-none focus:border-brand-magenta"
                    />

                    {error && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-magenta">{error}</p>
                    )}

                    <button
                        onClick={handle}
                        disabled={loading}
                        className="w-full bg-brand-black text-white py-5 font-black uppercase tracking-[0.3em] text-sm hover:bg-brand-magenta transition-all disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-brand-black/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">or</span>
                        <div className="flex-1 h-px bg-brand-black/20" />
                    </div>

                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full border-2 border-brand-black py-5 font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-brand-black hover:text-white transition-all disabled:opacity-50"
                    >
                        <Chrome className="w-5 h-5" /> Continue with Google
                    </button>

                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="w-full text-center text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-brand-magenta transition-all"
                    >
                        {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};