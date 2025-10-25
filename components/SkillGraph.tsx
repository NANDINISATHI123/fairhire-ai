import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Skill } from '../types';
import { AppContext } from './Layout';

interface SkillGraphProps {
    skills: Skill[];
}

const SkillGraph: React.FC<SkillGraphProps> = ({ skills }) => {
    const context = useContext(AppContext);

    if (!skills || skills.length === 0) {
        return <p className="text-center text-text-secondary">No skills data available.</p>;
    }
    
    return (
        <div className="space-y-4">
            {skills.map((skill, index) => (
                <div key={index} className="w-full">
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-semibold text-text-primary">{skill.skill}</span>
                        <span className="text-text-secondary">{skill.level}/100</span>
                    </div>
                    <div className="w-full bg-muted-background rounded-full h-2.5">
                        <motion.div
                            className="bg-brand-primary h-2.5 rounded-full"
                            style={{ width: `${skill.level}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        />
                    </div>
                    <p className={`text-xs ${context?.theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-1 italic`}>Justification: {skill.justification}</p>
                </div>
            ))}
        </div>
    );
};

export default SkillGraph;