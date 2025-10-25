import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import SummaryCard from '../components/SummaryCard';
import ExplainDecisionModal from '../components/ExplainDecisionModal';
import FairAICopilot from '../components/FairAICopilot';
import { supabase } from '../lib/supabaseClient';
import { SpinnerIcon } from '../components/icons';
import AIEthicsMeter from '../components/AIEthicsMeter';
import DemographicDistributionChart from '../components/DemographicDistributionChart';
import PeerBenchmarkingChart from '../components/PeerBenchmarkingChart';
import { Interview } from '../types';
import BiasSimulationModal from '../components/BiasSimulationModal';
import FairnessReplayModal from '../components/FairnessReplayModal';
import TemplateManagerModal from '../components/TemplateManagerModal';


type Tab = 'dashboard' | 'insights' | 'fairness' | 'employees' | 'alerts' | 'admin';

const Dashboard: React.FC = () => {
    const context = useContext(AppContext);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<Interview[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('interviews')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100); // Optimization: Limit to last 100 interviews for performance.
            
            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            setInterviews(data as Interview[]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const dashboardData = useMemo(() => {
        if (!interviews) return null;

        const totalCandidates = interviews.length;
        const avgFairness = totalCandidates > 0 ? interviews.reduce((acc, i) => acc.overall_score + i.overall_score, { overall_score: 0 } as any) / totalCandidates : 0;
        
        const demographics = [
            { name: '20-30', count: Math.floor(totalCandidates * 0.3) },
            { name: '31-40', count: Math.floor(totalCandidates * 0.5) },
            { name: '41+', count: Math.floor(totalCandidates * 0.2) },
        ];

        const allSkills = interviews.flatMap(i => i.skills || []);
        const skillAverages: { [key: string]: { total: number, count: number } } = {};
        allSkills.forEach(skill => {
            if (!skillAverages[skill.skill]) skillAverages[skill.skill] = { total: 0, count: 0 };
            skillAverages[skill.skill].total += skill.level;
            skillAverages[skill.skill].count += 1;
        });
        const peerBenchmarkData = Object.entries(skillAverages).map(([skill, data]) => ({
            skill,
            peerAverage: Math.round(data.total / data.count)
        })).slice(0, 7);

        return {
            summary: {
                candidatesScreened: totalCandidates,
                biasAlerts: 3,
                modelAccuracy: 96,
                fairnessScore: Math.round(avgFairness),
            },
            decisions: interviews.slice(0, 4),
            demographics,
            peerBenchmarkData,
            employees: interviews.slice(0,5).map(i => ({id: i.id, name: i.candidate_name, role: i.job_title, performance: i.overall_score, salary: Math.floor(50000 + Math.random() * 20000)}))
        };
    }, [interviews]);


    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center mt-16"><SpinnerIcon className="w-12 h-12" /></div>;
        }
        if (!dashboardData) {
            return <GlassCard><p className="text-center">Could not load dashboard data.</p></GlassCard>
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <SummaryCard title="Candidates Screened" value={dashboardData.summary.candidatesScreened} />
                                <SummaryCard title="Bias Alerts" value={dashboardData.summary.biasAlerts} alert />
                                <SummaryCard title="Model Accuracy" value={`${dashboardData.summary.modelAccuracy}%`} />
                                <SummaryCard title="Fairness Score" value={`${dashboardData.summary.fairnessScore}%`} />
                            </div>
                           <GlassCard>
                                <h2 className="text-xl font-bold font-poppins mb-4">Welcome, HR Admin</h2>
                                <p className="text-text-secondary">This is your central hub for monitoring AI-driven recruitment. Use the tabs above to explore fairness analytics, review candidate insights, and manage system settings. The FairAI Copilot on your right is ready to assist with any data queries.</p>
                           </GlassCard>
                        </div>
                        <div className="lg:col-span-1">
                            <FairAICopilot />
                        </div>
                    </div>
                );
            case 'insights':
                return (
                    <GlassCard>
                        <h2 className="text-xl font-bold font-poppins mb-4">Recent AI Decisions</h2>
                        <div className="space-y-3">
                            {dashboardData.decisions.map((decision: Interview) => (
                                <div key={decision.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted-background rounded-lg gap-3">
                                    <div>
                                        <p className="font-semibold">{decision.candidate_name}</p>
                                        <p className="text-sm text-text-secondary">Role: {decision.job_title} | Score: <span className="font-bold">{decision.overall_score}%</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => context?.showModal(<BiasSimulationModal interview={decision} />)} className="bg-amber-500/80 hover:bg-amber-500 text-white font-bold text-xs py-1 px-3 rounded-md">
                                            Simulate Bias
                                        </button>
                                        <button onClick={() => context?.showModal(<FairnessReplayModal interview={decision} />)} className="bg-sky-500/80 hover:bg-sky-500 text-white font-bold text-xs py-1 px-3 rounded-md">
                                            Audit Trail
                                        </button>
                                        <button onClick={() => context?.showModal(<ExplainDecisionModal interview={decision} />)} className="bg-brand-primary/80 hover:bg-brand-primary text-primary-foreground font-bold text-xs py-1 px-3 rounded-md">
                                            Explain
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                );
            case 'fairness':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard>
                            <h2 className="text-xl font-bold font-poppins mb-4">Overall Fairness Score</h2>
                             <AIEthicsMeter score={dashboardData.summary.fairnessScore} />
                        </GlassCard>
                         <GlassCard>
                            <h2 className="text-xl font-bold font-poppins mb-4">Candidate Age Distribution (Simulated)</h2>
                             <DemographicDistributionChart data={dashboardData.demographics} />
                        </GlassCard>
                        <GlassCard className="md:col-span-2">
                            <h2 className="text-xl font-bold font-poppins mb-4">Average Skill Scores Across All Roles</h2>
                             <PeerBenchmarkingChart data={dashboardData.peerBenchmarkData} />
                        </GlassCard>
                    </div>
                 );
            
            case 'employees':
                 return (
                     <GlassCard>
                        <h2 className="text-xl font-bold font-poppins mb-4">Recent Candidates (Simulated as Employees)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Interview Score</th>
                                        <th className="p-2">Est. Salary</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.employees.map((emp: any) => (
                                        <tr key={emp.id} className="border-b border-border/50">
                                            <td className="p-2 font-semibold">{emp.name}</td>
                                            <td className="p-2 text-text-secondary">{emp.role}</td>
                                            <td className="p-2">{emp.performance}%</td>
                                            <td className="p-2">${emp.salary.toLocaleString()}</td>
                                            <td className="p-2">
                                                <button className="text-xs bg-muted-hover-background px-2 py-1 rounded-md">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </GlassCard>
                 );
            case 'admin':
                return (
                    <GlassCard>
                        <h2 className="text-xl font-bold font-poppins mb-4">Admin Controls</h2>
                        <p className="text-text-secondary mb-6">Manage system-level settings and configurations.</p>
                        <div className="p-4 bg-muted-background rounded-lg">
                             <h3 className="font-bold">AI Prompt Management</h3>
                             <p className="text-sm text-text-secondary mb-4">Configure the AI's core behavior by editing system prompts.</p>
                             <button
                                 onClick={() => context?.showModal(<TemplateManagerModal />)}
                                 className="bg-brand-primary hover:bg-brand-secondary text-primary-foreground font-bold py-2 px-4 rounded-lg"
                             >
                                 Manage Prompts
                             </button>
                        </div>
                    </GlassCard>
                );

            default:
                return (
                     <GlassCard className="text-center p-8">
                        <h3 className="text-lg font-bold">Coming Soon</h3>
                        <p className="text-text-secondary mt-2">The '{activeTab}' section is under construction.</p>
                    </GlassCard>
                );
        }
    };
    
    const tabs: { id: Tab; label: string }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'insights', label: 'Insights' },
        { id: 'fairness', label: 'Fairness' },
        { id: 'employees', label: 'Employees' },
        { id: 'alerts', label: 'Alerts' },
        { id: 'admin', label: 'Admin' },
    ];

    return (
        <div>
            <BackButton to="/" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold font-poppins">HR Dashboard</h1>
            </div>

            <div className="mb-6 border-b border-border flex gap-2 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-semibold relative transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="underline"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                            />
                        )}
                    </button>
                ))}
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;