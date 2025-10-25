import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Interview, Message } from '../types';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import SkillGraph from '../components/SkillGraph';
import FairnessCharts from '../components/FairnessCharts';
import BackButton from '../components/BackButton';
import { SpinnerIcon } from '../components/icons';
import { motion } from 'framer-motion';
import PeerComparisonChart from '../components/PeerComparisonChart';
import SkillGrowthHeatmap from '../components/SkillGrowthHeatmap';
import { fetchHistoricalSkills } from '../lib/supabaseService';

const Report: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [interview, setInterview] = useState<Interview | null>(null);
    const [historicalSkills, setHistoricalSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInterview = async () => {
            if (!id || !context?.user) return;

            setLoading(true);
            const { data, error: dbError } = await supabase
                .from('interviews')
                .select('*')
                .eq('id', id)
                .single();

            if (dbError) {
                console.error("Error fetching single interview:", dbError.message, dbError);
                setError(`Could not fetch the interview report. A common cause is that Row-Level Security (RLS) is enabled on your 'interviews' table, but no policy allows read access for this record. Please check your RLS policies. Original error: ${dbError.message}`);
                setLoading(false);
                return;
            }

            if (data) {
                if (data.candidate_id !== context.user.id && context.user.role !== 'hr_admin') {
                    setError('You do not have permission to view this report.');
                    setLoading(false);
                    setTimeout(() => navigate('/'), 3000);
                    return;
                }

                setInterview(data as Interview);

                const historicalData = await fetchHistoricalSkills(data.candidate_id);
                setHistoricalSkills(historicalData);
            }
            setLoading(false);
        };

        if (context?.user) {
            fetchInterview();
        }
    }, [id, context?.user, navigate]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><SpinnerIcon className="w-12 h-12" /></div>;
    }

    if (error) {
        return <GlassCard className="text-center text-red-400 p-8">{error}</GlassCard>;
    }

    if (!interview) {
        return <GlassCard className="text-center">Interview not found.</GlassCard>;
    }

    const getScoreColor = (score: number) => {
        if (score > 75) return 'text-emerald-400';
        if (score > 50) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="max-w-6xl mx-auto">
            <BackButton />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <header className="mb-8">
                    <h1 className="text-4xl font-bold font-poppins">Interview Report</h1>
                    <p className="text-text-secondary">For {interview.candidate_name} - {interview.job_title}</p>
                    <p className="text-xs text-text-secondary">{new Date(interview.created_at).toLocaleString()}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <GlassCard>
                            <h2 className="text-2xl font-bold font-poppins mb-4">Summary</h2>
                            <p className="text-text-secondary">{interview.summary}</p>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-2xl font-bold font-poppins mb-4">Peer Benchmark</h2>
                            {/* The PeerComparisonChart is now rendered with live data from the interview record. */}
                            <PeerComparisonChart data={interview.peer_benchmark} />
                        </GlassCard>

                        <GlassCard>
                             <h2 className="text-2xl font-bold font-poppins mb-4">Skill Growth</h2>
                             <SkillGrowthHeatmap data={historicalSkills} />
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-2xl font-bold font-poppins mb-4">Transcript</h2>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {interview.transcript.map((msg: Message, i) => (
                                    <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-brand-primary text-primary-foreground' : 'bg-muted-background'}`}>
                                            <p className="font-bold text-sm capitalize">{msg.sender === 'ai' ? 'Interviewer' : 'Candidate'}</p>
                                            <p>{msg.text}</p>
                                        </div>
                                        {msg.feedback && (
                                            <div className="text-xs text-text-secondary italic mt-1 p-2 bg-muted-hover-background rounded-md max-w-lg w-full">
                                                <strong>Feedback:</strong> {msg.feedback.feedback} (Score: {msg.feedback.score}%)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-8">
                        <GlassCard className="text-center">
                            <h2 className="text-xl font-bold font-poppins mb-2">Overall Score</h2>
                            <p className={`text-6xl font-bold ${getScoreColor(interview.overall_score)}`}>
                                {Math.round(interview.overall_score)}%
                            </p>
                        </GlassCard>
                        
                        <GlassCard>
                            <h2 className="text-xl font-bold font-poppins mb-4">Badges Earned</h2>
                            <div className="flex flex-wrap gap-2">
                                {interview.badges.map(badge => (
                                    <span key={badge} className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
                                ))}
                                {interview.badges.length === 0 && <p className="text-sm text-text-secondary">No badges earned in this interview.</p>}
                            </div>
                        </GlassCard>

                        <GlassCard>
                            <h2 className="text-xl font-bold font-poppins mb-4">Skill Assessment</h2>
                            <SkillGraph skills={interview.skills} />
                        </GlassCard>

                         <GlassCard>
                            <h2 className="text-xl font-bold font-poppins mb-4">Fairness Metrics</h2>
                            <FairnessCharts transcript={interview.transcript} />
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Report;