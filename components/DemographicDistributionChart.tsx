import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props { data: any[]; }

const DemographicDistributionChart: React.FC<Props> = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="var(--text-secondary-color)" />
            <YAxis stroke="var(--text-secondary-color)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--muted-background)', border: '1px solid var(--border-color)' }} />
            <Legend />
            <Bar dataKey="count" name="Candidates" fill="var(--brand-primary)" />
        </BarChart>
    </ResponsiveContainer>
);
export default DemographicDistributionChart;
