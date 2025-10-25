
import React from 'react';
import GlassCard from './GlassCard';
import { PaperAirplaneIcon } from './icons';

const FairAICopilot: React.FC = () => {
    const examplePrompts = [
        "Why was candidate X rejected?",
        "Show gender bias report for last month.",
        "List employees with low performance."
    ];
    
    return (
        <GlassCard className="h-full flex flex-col">
            <h2 className="text-xl font-bold font-poppins mb-2">FairAI Copilot</h2>
            <p className="text-xs text-text-secondary mb-4">Ask questions about your recruitment data.</p>
            
            <div className="flex-grow bg-muted-background/50 rounded-lg p-3 space-y-2">
                {/* This is a mock chat history */}
                 <div className="text-xs p-2 rounded-lg bg-brand-primary text-primary-foreground self-end max-w-xs ml-auto">
                    Show me the latest bias alerts.
                </div>
                 <div className="text-xs p-2 rounded-lg bg-muted-hover-background self-start max-w-xs">
                    We have 3 new bias alerts this week, primarily related to age disparity in the Engineering department.
                </div>
            </div>
            
            <div className="mt-4 space-y-2">
                {examplePrompts.map(prompt => (
                     <button key={prompt} className="w-full text-left text-xs p-2 bg-muted-background hover:bg-muted-hover-background rounded-md transition-colors">
                        {prompt}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Ask FairAI..."
                    className="flex-grow bg-muted-background border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                <button className="p-2 bg-brand-primary hover:bg-brand-secondary text-primary-foreground rounded-lg">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
        </GlassCard>
    );
};

export default FairAICopilot;
