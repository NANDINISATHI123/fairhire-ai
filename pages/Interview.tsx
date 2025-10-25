import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { AppContext } from '../components/Layout';
import { Skill, Message } from '../types';
import { analyzeResume, generateInterviewQuestion, evaluateAnswer, generateSummary } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import GlassCard from '../components/GlassCard';
import SkillGraph from '../components/SkillGraph';
import { SpinnerIcon, PaperAirplaneIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '../components/icons';

type InterviewStage = 'setup' | 'analyzing' | 'review' | 'interview' | 'complete';

const Interview: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const { speak, stop, isSpeaking, isLoading: isTtsLoading } = useTextToSpeech();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [stage, setStage] = useState<InterviewStage>('setup');
    const [resumeText, setResumeText] = useState('');
    const [jobRole, setJobRole] = useState('');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [transcript, setTranscript] = useState<Message[]>([]);
    const [currentUserInput, setCurrentUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [error, setError] = useState('');

    const MAX_QUESTIONS = 5;

    useEffect(() => {
        return () => {
            stop(); // Stop any TTS when component unmounts
        };
    }, [stop]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleStartAnalysis = async () => {
        if (!resumeText.trim() || !jobRole.trim()) {
            setError('Please provide both a resume and a job role.');
            return;
        }
        setError('');
        setStage('analyzing');
        try {
            const extractedSkills = await analyzeResume(resumeText);
            setSkills(extractedSkills);
            setStage('review');
        } catch (err) {
            setError('Could not analyze the resume. Please try again.');
            setStage('setup');
        }
    };

    const startInterview = async () => {
        setStage('interview');
        setIsAiThinking(true);
        const firstMessage: Message = {
            sender: 'ai',
            text: `Hello! I'll be conducting your interview for the ${jobRole} position today. I've reviewed your skills. Let's begin.`,
            timestamp: new Date().toISOString()
        };
        setTranscript([firstMessage]);
        speak(firstMessage.text);
        
        const firstQuestion = await generateInterviewQuestion(jobRole, skills, firstMessage.text);
        const questionMessage: Message = { sender: 'ai', text: firstQuestion, timestamp: new Date().toISOString() };
        setTranscript(prev => [...prev, questionMessage]);
        speak(firstQuestion);
        setIsAiThinking(false);
    };

    const handleSendMessage = async () => {
        if (!currentUserInput.trim() || isAiThinking) return;

        const userMessage: Message = { sender: 'user', text: currentUserInput, timestamp: new Date().toISOString() };
        setTranscript(prev => [...prev, userMessage]);
        setCurrentUserInput('');
        setIsAiThinking(true);
        stop(); // Stop any previous speech

        try {
            const lastQuestion = transcript.filter(m => m.sender === 'ai').pop()?.text || '';
            const evaluation = await evaluateAnswer(lastQuestion, userMessage.text);
            
            // Add feedback to the user's message
            setTranscript(prev => prev.map(m => m.timestamp === userMessage.timestamp ? { ...m, feedback: evaluation } : m));

            if (transcript.filter(m => m.sender === 'user').length >= MAX_QUESTIONS) {
                await finishInterview();
                return;
            }

            const feedbackMessage: Message = { sender: 'ai', text: evaluation.feedback, timestamp: new Date().toISOString() };
            setTranscript(prev => [...prev, feedbackMessage]);
            speak(evaluation.feedback);

            const previousContext = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
            const nextQuestion = await generateInterviewQuestion(jobRole, skills, previousContext);
            const questionMessage: Message = { sender: 'ai', text: nextQuestion, timestamp: new Date().toISOString() };
            setTranscript(prev => [...prev, questionMessage]);
            speak(nextQuestion);

        } catch (err) {
            const errorMessage: Message = { sender: 'ai', text: "I'm sorry, I encountered an issue. Let's try that again.", timestamp: new Date().toISOString() };
            setTranscript(prev => [...prev, errorMessage]);
        } finally {
            setIsAiThinking(false);
        }
    };
    
    const finishInterview = async () => {
        setIsAiThinking(true);
        setStage('complete');
        const finalMessage: Message = { sender: 'ai', text: "Thank you, that concludes the interview. We're compiling your report now.", timestamp: new Date().toISOString() };
        setTranscript(prev => [...prev, finalMessage]);
        speak(finalMessage.text);

        try {
            const summary = await generateSummary(transcript);
            const overallScore = transcript
                .filter(m => m.sender === 'user' && m.feedback)
                .reduce((acc, cur) => acc + (cur.feedback?.score || 0), 0) / (transcript.filter(m => m.sender === 'user').length || 1);

            const { data, error: dbError } = await supabase.from('interviews').insert({
                candidate_name: context?.user?.email?.split('@')[0] || 'Candidate',
                job_role: jobRole,
                skills: skills,
                transcript: transcript,
                summary: summary,
                overall_score: overallScore,
                user_id: context?.user?.id
            }).select('id').single();

            if (dbError) throw dbError;

            setTimeout(() => {
                if (data?.id) {
                    navigate(`/report/${data.id}`);
                } else {
                    navigate('/candidate-dashboard');
                }
            }, 3000);

        } catch(err) {
            console.error("Error finishing interview:", err);
            setError("Could not save interview results. Please contact support.");
            // Don't redirect, let user see the error
        }
    };

    const renderStage = () => {
        switch (stage) {
            case 'setup':
                return (
                    <GlassCard className="w-full max-w-2xl">
                        <h1 className="text-3xl font-bold font-poppins text-center">{context?.translate('interviewSetupTitle')}</h1>
                        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
                        <div className="mt-8 space-y-6">
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder={context?.translate('pasteResume')}
                                className="w-full h-40 bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder={context?.translate('jobRolePlaceholder')}
                                className="w-full bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleStartAnalysis}
                                className="w-full bg-brand-primary text-primary-foreground font-bold py-3 px-6 rounded-lg"
                            >
                                {context?.translate('parseResume')}
                            </motion.button>
                        </div>
                    </GlassCard>
                );
            case 'analyzing':
                return (
                    <GlassCard className="text-center">
                        <SpinnerIcon className="w-12 h-12 mx-auto text-brand-primary" />
                        <p className="mt-4 text-lg font-semibold">{context?.translate('analyzing')}</p>
                    </GlassCard>
                );
            case 'review':
                return (
                    <GlassCard className="w-full max-w-2xl">
                        <h1 className="text-3xl font-bold font-poppins text-center">{context?.translate('skillsReview')}</h1>
                        <p className="text-text-secondary text-center mt-2 mb-8">{context?.translate('skillsReviewDesc')}</p>
                        <SkillGraph skills={skills} />
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={startInterview}
                            className="mt-8 w-full bg-brand-primary text-primary-foreground font-bold py-3 px-6 rounded-lg"
                        >
                            {context?.translate('startInterview')}
                        </motion.button>
                    </GlassCard>
                );
            case 'interview':
                return (
                    <GlassCard className="w-full max-w-3xl h-[70vh] flex flex-col">
                        <h2 className="text-xl font-bold font-poppins text-center mb-4">{context?.translate('interviewInProgress')}</h2>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            {transcript.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-brand-primary text-primary-foreground' : 'bg-muted-background'}`}>
                                        <p>{msg.text}</p>
                                        {msg.sender === 'ai' && i > 0 && (
                                            <button onClick={() => speak(msg.text)} disabled={isTtsLoading} className="mt-2 text-xs opacity-70 hover:opacity-100 flex items-center gap-1">
                                                <SpeakerWaveIcon className="w-4 h-4" /> Listen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="p-3 rounded-lg bg-muted-background flex items-center gap-2">
                                        <SpinnerIcon className="w-5 h-5" />
                                        <span className="text-sm italic">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="text"
                                value={currentUserInput}
                                onChange={(e) => setCurrentUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={context?.translate('yourAnswer')}
                                className="flex-grow bg-muted-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                disabled={isAiThinking}
                            />
                            <button onClick={isSpeaking ? stop : () => {}} className="p-3 bg-muted-background hover:bg-muted-hover-background rounded-lg">
                                {isSpeaking ? <SpeakerXMarkIcon className="w-6 h-6 text-red-400" /> : <SpeakerWaveIcon className="w-6 h-6" />}
                            </button>
                            <button onClick={handleSendMessage} disabled={isAiThinking} className="p-3 bg-brand-primary hover:bg-brand-secondary text-primary-foreground rounded-lg disabled:opacity-50">
                                <PaperAirplaneIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </GlassCard>
                );
            case 'complete':
                return (
                    <GlassCard className="text-center">
                        <h1 className="text-3xl font-bold font-poppins">{context?.translate('interviewComplete')}</h1>
                        <p className="mt-2 text-text-secondary">{context?.translate('interviewCompleteDesc')}</p>
                        <SpinnerIcon className="w-12 h-12 mx-auto text-brand-primary mt-8" />
                        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
                    </GlassCard>
                );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex justify-center"
                >
                    {renderStage()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Interview;
