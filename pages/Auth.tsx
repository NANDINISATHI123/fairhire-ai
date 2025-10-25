import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';
import { SpinnerIcon } from '../components/icons';
import { UserRole } from '../types';

const Auth: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('candidate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLoginView) {
                const passwordToUse = role === 'hr_admin' ? '111111' : password;
                const { error } = await supabase.auth.signInWithPassword({ email, password: passwordToUse });
                if (error) throw error;
                // Find the user's role after login to redirect correctly
                const { data: { session } } = await supabase.auth.getSession();
                const userRole = session?.user?.user_metadata?.role || 'candidate';
                navigate(userRole === 'hr_admin' ? '/dashboard' : '/candidate-dashboard');

            } else {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: {
                            role: role,
                        }
                    }
                });
                if (error) throw error;
                if (data.user?.identities?.length === 0) {
                     setError("User with this email already exists. Please log in.");
                } else {
                     setMessage(context?.translate('accountCreatedSuccess') || 'Account created! Please log in.');
                     setIsLoginView(true);
                     setPassword('');
                }
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Redirect if user is already logged in
    if (context?.user && !context.loading) {
        navigate(context.user.role === 'hr_admin' ? '/dashboard' : '/candidate-dashboard');
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard className="w-full max-w-sm">
                    <h1 className="text-3xl font-bold font-poppins text-center mb-2">
                        {isLoginView ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-center text-text-secondary mb-8">
                        {isLoginView ? 'Sign in to continue' : 'Get started with FairHire AI'}
                    </p>

                    {error && <p className="mb-4 text-center text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                    {message && <p className="mb-4 text-center text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-md">{message}</p>}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                         <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">{context?.translate('role')}</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem',
                                    appearance: 'none'
                                }}
                            >
                                <option value="candidate">{context?.translate('candidate')}</option>
                                <option value="hr_admin">{context?.translate('hrAdmin')}</option>
                            </select>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-primary-foreground font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                        >
                            {loading ? <SpinnerIcon className="w-6 h-6" /> : (isLoginView ? context?.translate('login') : 'Sign Up')}
                        </motion.button>
                    </form>

                    <div className="text-center mt-6">
                        <button 
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm text-text-secondary hover:text-brand-primary"
                        >
                            {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                        </button>
                    </div>

                </GlassCard>
            </motion.div>
        </div>
    );
};

export default Auth;