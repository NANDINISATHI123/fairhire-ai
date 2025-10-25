
import React, { useState } from 'react';
import { Interview } from '../types';
import { motion } from 'framer-motion';
import { SpinnerIcon } from './icons';

const BiasSimulationModal = ({ interview }: { interview: Interview }) => {
    const originalAnswer = interview.transcript.find(m => m.sender === 'user')?.text || "The candidate mentioned they graduated from Harvard and have two children.";
    const [modifiedAnswer, setModifiedAnswer] = useState(originalAnswer.replace(/Harvard/gi, "[UNIVERSITY]").replace(/two children/gi, "[FAMILY_STATUS]"));
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<{ originalScore: number, newScore: number } | null>(null);

    const handleSimulate = () => {
        setIsSimulating(true);
        setResult(null);
        // Simulate an API call
        setTimeout(() => {
            const originalScore = interview.transcript.find(m => m.sender === 'user')?.feedback?.score || 85;
            // Simulate a score change based on removed text
            const newScore = originalAnswer.toLowerCase().includes('harvard') ? originalScore - Math.floor(Math.random() * 5 + 3) : originalScore + Math.floor(Math.random() * 3);
            setResult({ originalScore, newScore: Math.max(0, Math.min(100, newScore)) });
            setIsSimulating(false);
        }, 1500);
    };
    
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-text-primary">Bias Simulation</h2>
            <p className="text-sm text-text-secondary mb-4">Test the model's fairness by removing potentially biasing information from an answer and re-evaluating it.</p>
            
            <div className="space-y-4">
                <div>
                    <label className="font-semibold text-sm">Original Answer</label>
                    <p className="text-sm bg-muted-background p-3 rounded-lg mt-1 text-text-secondary">{originalAnswer}</p>
                </div>
                 <div>
                    <label htmlFor="modified" className="font-semibold text-sm">Modified Answer (Bias Removed)</label>
                    <textarea
                        id="modified"
                        value={modifiedAnswer}
                        onChange={(e) => setModifiedAnswer(e.target.value)}
                        className="w-full h-24 bg-muted-hover-background border border-border rounded-lg p-3 mt-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </div>

            <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleSimulate}
                disabled={isSimulating}
                className="mt-6 bg-amber-500 text-white font-bold py-2 px-6 rounded-lg w-full flex items-center justify-center disabled:opacity-60"
            >
                {isSimulating ? <SpinnerIcon className="w-6 h-6" /> : 'Run Simulation'}
            </motion.button>

            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-muted-background rounded-lg text-center"
                >
                    <h3 className="font-bold text-lg">Simulation Result</h3>
                    <div className="flex justify-around items-center mt-2">
                        <div>
                             <p className="text-text-secondary text-sm">Original Score</p>
                             <p className="text-3xl font-bold">{result.originalScore}%</p>
                        </div>
                         <div>
                             <p className="text-text-secondary text-sm">New Score</p>
                             <p className="text-3xl font-bold text-amber-400">{result.newScore}%</p>
                        </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-3">A significant score change may indicate bias. This result is a simulation.</p>
                </motion.div>
            )}
        </div>
    );
};

export default BiasSimulationModal;