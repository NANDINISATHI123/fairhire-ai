import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { AppContext } from '../components/Layout';
import { TargetIcon, ScalesIcon, DocumentChartBarIcon } from '../components/icons';

const Home: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) {
        return null; // Or a loading spinner
    }

    const { translate, user } = context;

    const features = [
        {
            title: translate('feature1Title'),
            description: translate('feature1Desc'),
            icon: <TargetIcon className="w-8 h-8 text-brand-primary" />
        },
        {
            title: translate('feature2Title'),
            description: translate('feature2Desc'),
            icon: <ScalesIcon className="w-8 h-8 text-brand-primary" />
        },
        {
            title: translate('feature3Title'),
            description: translate('feature3Desc'),
            icon: <DocumentChartBarIcon className="w-8 h-8 text-brand-primary" />
        }
    ];

    const [titlePart1, titlePart2] = translate('homeTitle').split(', ');

    return (
        <div className="text-center py-16">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl md:text-7xl font-bold font-poppins mb-4"
            >
                {titlePart1}, <span className="text-brand-primary">{titlePart2}</span>
            </motion.h1>
            <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8"
            >
                {translate('homeSubtitle')}
            </motion.p>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center gap-4"
            >
                <Link to={user?.role === 'candidate' ? "/candidate-dashboard" : "/login"} className="bg-brand-primary hover:bg-brand-secondary text-primary-foreground font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                    {translate('startInterview')}
                </Link>
               
                <Link to={user?.role === 'hr_admin' ? "/dashboard" : "/login"} className="bg-muted-background hover:bg-muted-hover-background text-text-secondary font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                    {translate('viewHRDashboard')}
                </Link>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    >
                        <GlassCard className="text-left h-full">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold font-poppins mb-2">{feature.title}</h3>
                            <p className="text-text-secondary">{feature.description}</p>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;