
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TemplateManagerModal = () => {
    const [templates, setTemplates] = useState([
        { id: 1, name: 'Standard Behavioral', instruction: 'You are a helpful interviewer focusing on STAR method answers.' },
        { id: 2, name: 'Senior Technical Role', instruction: 'You are a senior engineer. Ask deep technical questions and follow-ups.' },
        { id: 3, name: 'Entry-Level Culture Fit', instruction: 'You are a friendly hiring manager. Assess enthusiasm and learning ability.' }
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
    
    return (
        <div className="p-2 w-[600px]">
            <h2 className="text-2xl font-bold text-text-primary">AI System Prompt Manager</h2>
            <p className="text-sm text-text-secondary mb-4">Manage and select the system prompt to guide the AI's interview style.</p>

            <div className="flex gap-6">
                <div className="w-1/3">
                    <h3 className="font-semibold text-sm mb-2">Templates</h3>
                    <div className="space-y-2">
                        {templates.map(template => (
                            <button 
                                key={template.id} 
                                onClick={() => setSelectedTemplate(template)}
                                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${selectedTemplate.id === template.id ? 'bg-brand-primary text-primary-foreground font-bold' : 'bg-muted-background hover:bg-muted-hover-background'}`}
                            >
                                {template.name}
                            </button>
                        ))}
                         <button className="w-full text-left p-2 rounded-md text-sm transition-colors text-text-secondary hover:bg-muted-hover-background">+ New Template</button>
                    </div>
                </div>
                <div className="w-2/3">
                    <h3 className="font-semibold text-sm mb-2">System Instruction</h3>
                    <textarea
                        value={selectedTemplate.instruction}
                        // onChange not implemented for this example
                        readOnly
                        className="w-full h-32 bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                     <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="mt-4 bg-brand-primary text-primary-foreground font-bold py-2 px-6 rounded-lg w-full"
                    >
                        Save & Apply
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default TemplateManagerModal;
