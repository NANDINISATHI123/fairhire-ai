import React, { useContext } from 'react';
import { Message } from '../types';
import { AppContext } from './Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FairnessChartsProps {
    transcript: Message[];
}

const FairnessCharts: React.FC<FairnessChartsProps> = ({ transcript }) => {
    const context = useContext(AppContext);
    const theme = context?.theme || 'dark';

    const performanceData = transcript
        .filter(m => m.sender === 'user' && m.feedback)
        .map((msg, i) => ({
            name: `Q${i + 1}`,
            score: msg.feedback?.score || 0,
            confidence: msg.feedback?.confidence || 0,
        }));
    
    const averageScore = performanceData.reduce((acc, cur) => acc + cur.score, 0) / (performanceData.length || 1);

    if (performanceData.length === 0) {
        return <div className="flex items-center justify-center h-full"><p className="text-text-secondary">No performance data to display.</p></div>;
    }

    const axisColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1';
    const tooltipBg = theme === 'dark' ? '#2a2a2a' : '#ffffff';
    const tooltipBorder = theme === 'dark' ? '#444' : '#cbd5e1';


    return (
        <div className="space-y-8 h-full flex flex-col justify-around">
            <div>
                <h3 className="text-lg font-bold text-center mb-4">Performance Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" stroke={axisColor} />
                        <YAxis stroke={axisColor} />
                        <Tooltip
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.5rem' }}
                            labelStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="confidence" stroke="#10b981" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="text-center">
                 <h3 className="text-lg font-bold">Average Score</h3>
                 <p className="text-4xl font-bold text-brand-primary mt-2">{Math.round(averageScore)}%</p>
            </div>
        </div>
    );
};

export default FairnessCharts;