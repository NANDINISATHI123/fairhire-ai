
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { SpinnerIcon } from '../components/icons';

const ResetPassword = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        // Supabase's onAuthStateChange is the recommended way to handle the password recovery event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setHasToken(true);
            }
        });
        
        // Also check URL hash for immediate feedback in case event is missed
        if (window.location.hash.includes('access_token')) {
            setHasToken(true);
        }

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError(context?.translate('passwordsDoNotMatch') || 'Passwords do not match.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            
            setMessage(context?.translate('passwordUpdatedSuccess') || 'Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error: any) {
            setError(error.error_description || error.message || 'Failed to update password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!hasToken) {
        return (
             <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                 <GlassCard>
                    <p className="text-center text-red-400">Invalid or expired password reset link. Please request a new one.</p>
                 </GlassCard>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-sm">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard>
                        <h1 className="text-3xl font-bold font-poppins text-center mb-2">
                            {context?.translate('setNewPassword')}
                        </h1>
                         <p className="text-center text-text-secondary mb-8">
                            {context?.translate('enterNewPassword')}
                        </p>

                        {error && <p className="mb-4 text-center text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                        {message && <p className="mb-4 text-center text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-md">{message}</p>}

                        <form onSubmit={handleResetPassword} className="space-y-4">
                             <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={context?.translate('newPassword')}
                                required
                                className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                             <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={context?.translate('confirmNewPassword')}
                                required
                                className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={loading || !!message}
                                className="w-full bg-brand-primary text-primary-foreground font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                            >
                                {loading ? <SpinnerIcon className="w-6 h-6" /> : context?.translate('updatePassword')}
                            </motion.button>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
