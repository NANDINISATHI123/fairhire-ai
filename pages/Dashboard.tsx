import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Interview } from '../types';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { SpinnerIcon } from '../components/icons';
import FairnessReplayModal from '../components/FairnessReplayModal';
import BiasSimulationModal from '../components/BiasSimulationModal';
import TemplateManagerModal from '../components/TemplateManagerModal';

const Dashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInterviews = async () => {
            const { data, error: dbError } = await supabase
                .from('interviews')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (dbError) {
                console.error("Error fetching interviews:", dbError.message, dbError);
                setError(`Failed to fetch interviews. A common cause is that Row-Level Security (RLS) is enabled on your 'interviews' table in Supabase, but no policy allows read access. Please check your RLS policies. Original error: ${dbError.message}`);
            } else if (data) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    createdAt: item.created_at,
                    candidateName: item.candidate_name,
                    jobRole: item.job_role,
                    overallScore: item.overall_score,
                    userId: item.user_id
                }));
                setInterviews(formattedData);
            }
            setLoading(false);
        };

        fetchInterviews();
    }, []);

    const showFairnessReplay = (interview: Interview) => {
        context?.showModal(<FairnessReplayModal interview={interview} />);
    };
    
    const showBiasSimulation = (interview: Interview) => {
        context?.showModal(<BiasSimulationModal interview={interview} />);
    };

    const showTemplateManager = () => {
        context?.showModal(<TemplateManagerModal />);
    };

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
                    <p className="text-text-secondary">No interviews have been completed yet.</p>
                </GlassCard>
            );
        }

        return (
            <div className="space-y-4">
                {interviews.map(interview => (
                    <GlassCard key={interview.id} className="!p-0 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5 items-center">
                            <div className="p-4 col-span-2">
                                <h3 className="font-bold text-lg">{interview.candidateName}</h3>
                                <p className="text-sm text-text-secondary">{interview.jobRole}</p>
                                <p className="text-xs text-text-secondary mt-1">{new Date(interview.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-sm text-text-secondary">Overall Score</p>
                                <p className={`text-2xl font-bold ${interview.overallScore > 75 ? 'text-emerald-400' : interview.overallScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {Math.round(interview.overallScore)}%
                                </p>
                            </div>
                            <div className="p-4 col-span-2 flex justify-end gap-2">
                                <button onClick={() => showBiasSimulation(interview)} className="bg-muted-background hover:bg-muted-hover-background font-bold py-2 px-3 rounded-lg text-sm">Bias Test</button>
                                <button onClick={() => showFairnessReplay(interview)} className="bg-muted-background hover:bg-muted-hover-background font-bold py-2 px-3 rounded-lg text-sm">Audit Trail</button>
                                <Link to={`/report/${interview.id}`} className="bg-brand-primary hover:bg-brand-secondary text-primary-foreground font-bold py-2 px-4 rounded-lg text-sm">View Report</Link>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold font-poppins">HR Dashboard</h1>
                <button onClick={showTemplateManager} className="bg-brand-primary text-primary-foreground font-bold py-2 px-4 rounded-lg">Manage AI Prompts</button>
            </div>
            
            {renderContent()}
        </div>
    );
};

export default Dashboard;