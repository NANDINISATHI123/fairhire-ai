
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Language, UserRole } from '../types';
import { translations, languages } from '../constants';
import { SunIcon, MoonIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'light' | 'dark';

interface AppContextType {
    user: (User & { role: UserRole }) | null;
    loading: boolean;
    language: Language;
    setLanguage: (lang: Language) => void;
    translate: (key: string) => string;
    showModal: (content: React.ReactNode) => void;
    closeModal: () => void;
    theme: Theme;
    toggleTheme: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<(User & { role: UserRole }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState<Language>('en');
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    }, []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const role = session.user.user_metadata.role || 'candidate';
                setUser({ ...session.user, role });
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const role = session.user.user_metadata.role || 'candidate';
                setUser({ ...session.user, role });
            } else {
                setUser(null);
            }
            if (_event !== 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const translate = useCallback((key: string): string => {
        return translations[language][key] || key;
    }, [language]);

    const showModal = useCallback((content: React.ReactNode) => setModalContent(content), []);
    const closeModal = useCallback(() => setModalContent(null), []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };
    
    const contextValue = useMemo(() => ({
        user,
        loading,
        language,
        setLanguage,
        translate,
        showModal,
        closeModal,
        theme,
        toggleTheme
    }), [user, loading, language, translate, showModal, closeModal, theme, toggleTheme]);

    return (
        <AppContext.Provider value={contextValue}>
            <div className="bg-background text-text-primary min-h-screen font-sans">
                <header className="py-4 px-8 flex justify-between items-center bg-transparent">
                    <a href="/#/" className="text-2xl font-bold font-poppins text-brand-primary">FairHire AI</a>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                             <button className="flex items-center gap-2 font-semibold text-text-secondary">
                                {languages.find(l => l.code === language)?.flag}
                             </button>
                             <div className="absolute right-0 mt-2 p-1 w-32 bg-card-background border border-card-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity z-50">
                                {languages.map(lang => (
                                    <button key={lang.code} onClick={() => setLanguage(lang.code)} className="w-full text-left px-3 py-1 rounded hover:bg-muted-hover-background text-sm flex items-center gap-2">
                                        {lang.flag} {lang.name}
                                    </button>
                                ))}
                             </div>
                        </div>
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-muted-background hover:bg-muted-hover-background">
                            <AnimatePresence mode="wait" initial={false}>
                                {theme === 'dark' ? (
                                    <motion.div key="moon" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <MoonIcon className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="sun" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <SunIcon className="w-5 h-5 text-amber-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                        {user ? (
                            <>
                                <span className="text-sm text-text-secondary hidden md:inline">Welcome, {user.email}</span>
                                <button onClick={handleLogout} className="bg-muted-background hover:bg-muted-hover-background font-bold py-2 px-4 rounded-lg text-sm">{translate('logout')}</button>
                            </>
                        ) : (
                           <a href="/#/login" className="bg-brand-primary hover:bg-brand-secondary text-primary-foreground font-bold py-2 px-4 rounded-lg text-sm">{translate('login')}</a>
                        )}
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
                {modalContent && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeModal}>
                        <div className="bg-card-background backdrop-blur-lg border border-card-border rounded-2xl shadow-2xl max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                           <div className="p-1 relative">
                                <button onClick={closeModal} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
                                {modalContent}
                           </div>
                        </div>
                    </div>
                )}
            </div>
        </AppContext.Provider>
    );
};

export default Layout;