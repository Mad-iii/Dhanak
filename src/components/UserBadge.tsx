import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserBadge: React.FC = () => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    if (!user) return null;

    const firstName = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 border-2 border-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-brand-black hover:text-white transition-all"
            >
                <User className="w-3 h-3" />
                {firstName}
                <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-2 bg-brand-ivory border-4 border-brand-black shadow-[8px_8px_0px_#FF0080] min-w-[200px] z-50"
                    >
                        <div className="p-4 border-b-2 border-brand-black">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Signed in as</p>
                            <p className="text-sm font-bold truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={() => { logout(); setOpen(false); }}
                            className="w-full flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest hover:bg-brand-magenta hover:text-white transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};