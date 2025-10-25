import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Interview } from '../types';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { SpinnerIcon } from '../components/icons';

const CandidateDashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInterviews = async () => {
            if (!context?.user) return;

            const { data, error: dbError } = await supabase
                .from('interviews')
                .select('*')
                .eq('user_id', context.user.id)
                .order('created_at', { ascending: false });
            
            if (dbError) {
                console.error("Error fetching candidate interviews:", dbError.message, dbError);
                setError(`Failed to fetch your interviews. A common cause is that Row-Level Security (RLS) is enabled on the 'interviews' table in Supabase, but no policy allows read access. Please check your RLS policies. Original error: ${dbError.message}`);
            } else if (data) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    createdAt: item.created_at,
                    jobRole: item.job_role,
                    overallScore: item.overall_score,
                    candidateName: item.candidate_name,
                    userId: item.user_id,
                }));
                setInterviews(formattedData);
            }
            setLoading(false);
        };

        if (context?.user) {
            fetchInterviews();
        } else if (!context?.loading) {
            setLoading(false);
        }
    }, [context?.user, context?.loading]);
    
    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-12 h-12" /></div>;
        }

        if (error) {
            return (
                <GlassCard className="text-center p-8">
                    <h3 className="text-lg font-bold text-red-400">Error Fetching Data</h3>
                    <p className="text-text-secondary mt-2">{error}</p>
                </GlassCard>
            );
        }

        if (interviews.length === 0) {
            return (
                <GlassCard className="text-center p-8">
                    <p className="text-text-secondary">You haven't completed any interviews yet.</p>
                </GlassCard>
            );
        }

        return (
            <div className="space-y-4">
                {interviews.map(interview => (
                    <GlassCard key={interview.id} className="!p-0 overflow-hidden">
                         <div className="flex justify-between items-center p-4">
                            <div>
                                <h3 className="font-bold text-lg">{interview.jobRole}</h3>
                                <p className="text-sm text-text-secondary">{new Date(interview.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-text-secondary">Overall Score</p>
                                <p className={`text-2xl font-bold ${interview.overallScore > 75 ? 'text-emerald-400' : interview.overallScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {Math.round(interview.overallScore)}%
                                </p>
                            </div>
                            <Link to={`/report/${interview.id}`} className="bg-muted-background hover:bg-muted-hover-background font-bold py-2 px-4 rounded-lg">View Report</Link>
                        </div>
                    </GlassCard>
                ))}
            </div>
        );
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold font-poppins">My Interviews</h1>
                <Link to="/interview/new" className="bg-brand-primary hover:bg-brand-secondary text-primary-foreground font-bold py-3 px-6 rounded-lg text-lg">
                    Start New Interview
                </Link>
            </div>
            {renderContent()}
        </div>
    );
};

export default CandidateDashboard;