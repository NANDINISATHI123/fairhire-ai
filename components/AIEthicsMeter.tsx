import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface Props { score: number; }

const AIEthicsMeter: React.FC<Props> = ({ score }) => {
    const data = [{ name: 'Fairness Score', value: score, fill: 'var(--brand-primary)' }];
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
                innerRadius="70%" 
                outerRadius="85%" 
                barSize={30} 
                data={data} 
                startAngle={90} 
                endAngle={-270}
            >
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                />
                <RadialBar
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={15}
                />
                <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-5xl font-bold fill-current text-text-primary"
                >
                    {`${Math.round(score)}%`}
                </text>
                 <text 
                    x="50%" 
                    y="65%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    className="text-sm font-semibold fill-current text-text-secondary"
                >
                    Fairness Score
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
export default AIEthicsMeter;
