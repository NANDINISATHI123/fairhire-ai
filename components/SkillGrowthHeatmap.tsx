import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    data: { skill: string, scores: { date: string, score: number }[] }[];
}

const SkillGrowthHeatmap: React.FC<Props> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-text-secondary">No historical skill data available to show growth.</p>;
    }
    
    const colors = ['#8b5cf6', '#4ade80', '#f59e0b', '#3b82f6', '#ef4444'];

    // FIX: Explicitly provide the generic type to `new Set<string>()`.
    // This resolves TypeScript errors where the elements of `allDates` were being inferred as `unknown`,
    // causing failures in the subsequent `sort` and `map` calls.
    const allDates = [...new Set<string>(data.flatMap(skill => skill.scores.map(s => s.date)))].sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

    const chartData = allDates.map(date => {
        const entry: { date: string; [key: string]: number | string | null } = { date };
        data.forEach(skillData => {
            const scoreOnDate = skillData.scores.find(s => s.date === date);
            entry[skillData.skill] = scoreOnDate ? scoreOnDate.score : null;
        });
        return entry;
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="var(--text-secondary-color)" />
                <YAxis stroke="var(--text-secondary-color)" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--muted-background)', border: '1px solid var(--border-color)' }} />
                <Legend />
                {data.map((skill, i) => (
                    <Line key={skill.skill} type="monotone" dataKey={skill.skill} stroke={colors[i % colors.length]} connectNulls strokeWidth={2} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};
export default SkillGrowthHeatmap;