import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PeerBenchmark } from '../types';

interface Props { 
    data: PeerBenchmark[]; 
}

const PeerComparisonChart: React.FC<Props> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary-color)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-secondary-color)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--muted-background)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                <Legend />
                <Radar name="Your Score" dataKey="level" stroke="var(--brand-primary)" fill="var(--brand-primary)" fillOpacity={0.6} />
                <Radar name="Peer Average" dataKey="peerAverage" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default PeerComparisonChart;
