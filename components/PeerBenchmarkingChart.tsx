import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { 
    data: { skill: string, peerAverage: number }[]; 
}

const PeerBenchmarkingChart: React.FC<Props> = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis type="number" stroke="var(--text-secondary-color)" domain={[0, 100]} />
            <YAxis type="category" dataKey="skill" stroke="var(--text-secondary-color)" width={120} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--muted-background)', border: '1px solid var(--border-color)' }} />
            <Legend />
            <Bar dataKey="peerAverage" name="Average Score" fill="var(--brand-primary)" />
        </BarChart>
    </ResponsiveContainer>
);
export default PeerBenchmarkingChart;
