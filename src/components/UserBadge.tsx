import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserBadge: React.FC = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!user) return null;

    const firstName = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? '?';
    const initials = (user.displayName ?? user.email ?? '?')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="relative" ref={ref}>
            {/* Avatar button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-brand-black text-white border-2 border-brand-black shadow-[3px_3px_0px_#FF0080] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all font-black text-[11px] uppercase tracking-wider"
                title={user.email}
            >
                {initials || <User className="w-4 h-4" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-3 bg-brand-ivory border-4 border-brand-black shadow-[8px_8px_0px_#FF0080] min-w-[220px] z-[100]"
                    >
                        {/* User info */}
                        <div className="p-4 border-b-2 border-brand-black flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-magenta text-white font-black text-[11px] shrink-0 border-2 border-brand-black">
                                {initials || <User className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{firstName}</p>
                                <p className="text-[10px] font-bold opacity-40 truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Sign out */}
                        <button
                            onClick={() => { logout(); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-brand-magenta hover:text-white transition-all group"
                        >
                            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};