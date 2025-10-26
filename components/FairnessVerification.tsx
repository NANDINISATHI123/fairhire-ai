import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import AIEthicsMeter from './AIEthicsMeter';
import { CameraIcon, UploadIcon, ShieldCheckIcon, InformationCircleIcon, SpinnerIcon } from './icons';
import { AnalysisResult } from '../types';

const FairnessVerification: React.FC = () => {
    const [mode, setMode] = useState<'idle' | 'record' | 'upload'>('idle');
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [privacyMode, setPrivacyMode] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cleanup = useCallback(() => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setVideoFile(null);
        setAnalysisResult(null);
        setError(null);
        setMode('idle');
    }, [videoStream]);

    const handleStartRecording = async () => {
        cleanup();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setVideoStream(stream);
            setMode('record');
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Could not access your camera. Please check your browser permissions.");
        }
    };
    
    const handleUploadClick = () => {
        cleanup();
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setMode('upload');
            if (videoRef.current) {
                videoRef.current.srcObject = null; // Clear any previous stream
                videoRef.current.src = URL.createObjectURL(file);
            }
        }
    };

    const handleAnalyze = () => {
        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        // Simulate AI analysis
        setTimeout(() => {
            const biasScore = Math.floor(Math.random() * 15) + 85; // Score between 85 and 100
            const tone = ['Neutral', 'Professional', 'Positive'][Math.floor(Math.random() * 3)];
            const explanation = "AI analysis of speech patterns, tone, and pacing indicates a neutral and professional demeanor. No indicators of potential bias were detected in the interaction. The environment was deemed fair and consistent.";

            setAnalysisResult({ biasScore, tone, explanation });
            setIsLoading(false);
            
            if (privacyMode) {
                 setTimeout(() => cleanup(), 200);
            }
        }, 2500);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-8">
                    <SpinnerIcon className="w-16 h-16 mx-auto text-brand-primary" />
                    <p className="mt-4 text-lg font-semibold">Analyzing for Fairness...</p>
                    <p className="text-sm text-text-secondary">This may take a moment. We're checking for bias indicators without storing personal data.</p>
                </div>
            );
        }

        if (analysisResult) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="text-xl font-bold font-poppins mb-4">Fairness Score</h3>
                        <AIEthicsMeter score={analysisResult.biasScore} />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-poppins">Analysis Summary</h3>
                        <div className="bg-muted-background p-4 rounded-lg">
                            <p className="text-sm font-semibold text-text-secondary">Bias Risk Score</p>
                            <p className="text-2xl font-bold text-emerald-400">{100 - analysisResult.biasScore}% Risk</p>
                        </div>
                         <div className="bg-muted-background p-4 rounded-lg">
                            <p className="text-sm font-semibold text-text-secondary">Detected Emotional Tone</p>
                            <p className="text-lg font-bold">{analysisResult.tone}</p>
                        </div>
                         <div className="bg-muted-background p-4 rounded-lg">
                            <p className="text-sm font-semibold text-text-secondary">AI Fairness Explanation</p>
                            <p className="text-sm">{analysisResult.explanation}</p>
                        </div>
                        <button onClick={cleanup} className="w-full bg-muted-hover-background font-bold py-2 px-4 rounded-lg">
                            Start New Verification
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6">
                <div className="relative">
                     <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full aspect-video rounded-lg bg-black transition-opacity duration-300 ${mode === 'idle' ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {mode === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted-background rounded-lg">
                            <ShieldCheckIcon className="w-16 h-16 text-brand-primary mb-4" />
                             <h3 className="text-xl font-bold">Ready to Verify</h3>
                             <p className="text-text-secondary">Record or upload a video to begin.</p>
                        </div>
                    )}
                </div>

                {error && <p className="text-center text-red-400 mt-2 text-sm">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                     <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartRecording} className="flex items-center justify-center gap-2 p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold">
                         <CameraIcon className="w-6 h-6" /> Record Video
                    </motion.button>
                     <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleUploadClick} className="flex items-center justify-center gap-2 p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold">
                         <UploadIcon className="w-6 h-6" /> Upload Video
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnalyze}
                        disabled={!videoStream && !videoFile}
                        className="p-4 bg-brand-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                         <ShieldCheckIcon className="w-6 h-6" /> Analyze
                    </motion.button>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
                </div>
            </div>
        );
    };

    return (
        <GlassCard>
            <div className="flex justify-between items-start mb-4 px-6 pt-4">
                <div>
                    <h2 className="text-xl font-bold font-poppins">Fairness Verification</h2>
                    <p className="text-text-secondary text-sm">Upload or record an interview for an unbiased evaluation.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                         <label htmlFor="privacy-toggle" className="text-sm font-medium cursor-pointer">Privacy Mode</label>
                         <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="privacy-toggle"
                                id="privacy-toggle"
                                checked={privacyMode}
                                onChange={() => setPrivacyMode(!privacyMode)}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            />
                             <label htmlFor="privacy-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                         </div>
                         <style>{`.toggle-checkbox:checked { right: 0; border-color: var(--brand-primary); } .toggle-checkbox:checked + .toggle-label { background-color: var(--brand-primary); }`}</style>
                    </div>
                     <div className="group relative flex justify-center">
                         <InformationCircleIcon className="w-5 h-5 text-text-secondary" />
                         <span className="absolute bottom-full mb-2 w-64 p-2 bg-muted-hover-background text-text-primary text-xs rounded-md scale-0 transition-all group-hover:scale-100 origin-bottom">
                             When enabled, videos are processed locally and never saved. Only the anonymous fairness metrics are stored to ensure transparent, bias-free hiring.
                        </span>
                    </div>
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                     key={analysisResult ? 'result' : isLoading ? 'loading' : 'idle'}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </GlassCard>
    );
};

export default FairnessVerification;
