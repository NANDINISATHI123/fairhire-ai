
import React from 'react';
import GlassCard from './GlassCard';

interface SummaryCardProps {
    title: string;
    value: string | number;
    alert?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, alert = false }) => {
    return (
        <GlassCard className="text-center !p-4">
            <p className="text-sm text-text-secondary">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${alert ? 'text-amber-400' : 'text-text-primary'}`}>
                {value}
            </p>
        </GlassCard>
    );
};

export default SummaryCard;
