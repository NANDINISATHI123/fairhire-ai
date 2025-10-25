
import React, { useContext } from 'react';
import { Interview } from '../types';
import { CubeTransparentIcon } from './icons';
import { motion } from 'framer-motion';
import { AppContext } from './Layout';

const OnChainProofModal = ({ interview }: { interview: Interview }) => {
    const transactionHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <CubeTransparentIcon className="w-6 h-6" />
                On-Chain Proof of Fairness
            </h3>
            <p className="text-sm text-text-secondary mb-4">This record is a simulation of an immutable transaction on a blockchain, confirming the interview's integrity.</p>
            <div className="space-y-2 text-sm bg-muted-background p-3 rounded-lg font-mono">
                <div className="flex justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <span className="text-emerald-400 font-bold">Confirmed</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-text-secondary">Block Number:</span>
                    <span>{Math.floor(Date.now() / 10000)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-text-secondary">Timestamp:</span>
                    <span>{new Date(interview.createdAt).toISOString()}</span>
                </div>
                 <div className="flex justify-between items-start">
                    <span className="text-text-secondary">Interview ID:</span>
                    <span className="text-right truncate ml-4">{interview.id}</span>
                </div>
                <div className="flex justify-between items-start">
                    <span className="text-text-secondary">Transaction Hash:</span>
                    <span className="text-right text-brand-primary truncate ml-4">{transactionHash}</span>
                </div>
            </div>
        </div>
    );
};

const FairnessReplayModal = ({ interview }: { interview: Interview }) => {
    const context = useContext(AppContext);
    
    const events = [
        { time: new Date(interview.createdAt).toLocaleTimeString(), description: "Interview session initiated.", icon: '▶️' },
        { time: new Date(new Date(interview.createdAt).getTime() + 2000).toLocaleTimeString(), description: "Resume parsed & skills identified.", icon: '📄' },
        { time: new Date(new Date(interview.createdAt).getTime() + 5000).toLocaleTimeString(), description: "First question generated. Fairness check passed.", icon: '✅' },
        ...interview.transcript.slice(0, 5).map((msg, i) => ({
             time: new Date(new Date(interview.createdAt).getTime() + 10000 * (i + 1)).toLocaleTimeString(),
             description: msg.sender === 'ai' ? `Question ${i+1} delivered.` : `Answer ${i+1} received. PII scan complete.`,
             icon: msg.sender === 'ai' ? '🤖' : '👤'
        })),
        { time: new Date(new Date(interview.createdAt).getTime() + 60000).toLocaleTimeString(), description: "Interview concluded. Report generated.", icon: '🏁' },
        { time: new Date(new Date(interview.createdAt).getTime() + 62000).toLocaleTimeString(), description: "Audit log finalized and ready for review.", icon: '🔒' }
    ];

    if (!context) {
        return null;
    }

    const handleOnChainClick = () => {
        context.showModal(<OnChainProofModal interview={interview} />);
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-4">
                 <div>
                    <h2 className="text-2xl font-bold text-text-primary">Fairness Replay</h2>
                    <p className="text-sm text-text-secondary">Audit trail for {interview.candidateName}'s interview.</p>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleOnChainClick}
                    className="bg-muted-hover-background text-emerald-400 font-bold py-2 px-3 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                    <CubeTransparentIcon className="w-5 h-5"/>
                    View On-Chain Proof
                </motion.button>
            </div>
           
            <div className="relative pl-4">
                 <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                 {events.map((event, index) => (
                    <div key={index} className="flex items-start mb-4">
                        <div className="z-10 bg-background flex items-center justify-center w-8 h-8 rounded-full border-2 border-border mr-4">{event.icon}</div>
                        <div className="pt-1">
                            <p className="font-bold text-text-primary">{event.description}</p>
                            <p className="text-xs text-text-secondary">{event.time}</p>
                        </div>
                    </div>
                 ))}
            </div>
        </div>
    );
};

export default FairnessReplayModal;