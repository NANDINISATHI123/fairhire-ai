import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import AIEthicsMeter from './AIEthicsMeter';
import { CameraIcon, UploadIcon, ShieldCheckIcon, InformationCircleIcon, SpinnerIcon, StopIcon } from './icons';
import { AnalysisResult } from '../types';

type CameraState = 'idle' | 'preview' | 'recording' | 'recorded' | 'upload';

const FairnessVerification: React.FC = () => {
    const [cameraState, setCameraState] = useState<CameraState>('idle');
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [privacyMode, setPrivacyMode] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const cleanup = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];

        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = '';
            videoRef.current.removeAttribute('src');
        }
        setVideoFile(null);
        setAnalysisResult(null);
        setError(null);
        setCameraState('idle');
    }, [videoStream]);

    const handleEnableCamera = async () => {
        cleanup();
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setVideoStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraState('preview');
        } catch (err: any) {
            console.error("Error accessing webcam:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera access was denied. Please enable camera permissions in your browser settings and try again.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("No camera found. Please ensure your webcam is connected and not disabled.");
            } else if (err.name === 'NotReadableError') {
                 setError("Could not start video source. Your camera might be in use by another application. Please close other apps (like Zoom, Skype, etc.) and try again.");
            } else {
                setError("An unknown error occurred while trying to access your camera. Please try again or check your device.");
            }
            cleanup();
        }
    };
    
    const handleStartRecording = () => {
        if (!videoStream) {
            setError("Camera stream is not available. Please enable the camera first.");
            return;
        }

        setCameraState('recording');

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(videoStream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const file = new File([blob], "recording.webm", { type: "video/webm" });
            setVideoFile(file);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = URL.createObjectURL(file);
            }
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
            setCameraState('recorded');
        };

        recorder.start();
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
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
            setCameraState('upload');
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = URL.createObjectURL(file);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!videoFile) {
            setError("No video file is available to analyze.");
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        setError(null);

        // Simulate API call for demonstration purposes
        setTimeout(() => {
            const mockResult: AnalysisResult = {
                biasScore: 90,
                tone: 'Neutral',
                explanation: 'Sample analysis: No bias indicators detected. (Mock Data)',
            };
            setAnalysisResult(mockResult);
            setIsLoading(false);
        }, 2000);
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
                    <GlassCard className="!p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold font-poppins mb-4">Analysis Summary</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-text-secondary">Bias Risk Score</p>
                                    <p className="text-2xl font-bold text-emerald-400">{100 - analysisResult.biasScore}% Risk</p>
                                </div>
                                 <div>
                                    <p className="text-sm font-semibold text-text-secondary">Detected Emotional Tone</p>
                                    <p className="text-lg font-bold">{analysisResult.tone}</p>
                                </div>
                                 <div>
                                    <p className="text-sm font-semibold text-text-secondary">AI Fairness Explanation</p>
                                    <p className="text-sm mt-1">{analysisResult.explanation}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={cleanup} className="mt-6 w-full bg-muted-hover-background font-bold py-2 px-4 rounded-lg">
                            Start New Verification
                        </button>
                    </GlassCard>
                </div>
            );
        }

        const isCameraOn = cameraState === 'recording' || cameraState === 'preview';
        const hasVideo = cameraState === 'recorded' || cameraState === 'upload';

        return (
            <div className="p-6">
                <div className="relative">
                     <video
                        ref={videoRef}
                        autoPlay={isCameraOn}
                        muted={isCameraOn}
                        controls={hasVideo}
                        playsInline
                        className={`w-full aspect-video rounded-lg bg-black transition-opacity duration-300 ${cameraState === 'idle' ? 'opacity-0' : 'opacity-100'}`}
                    />
                    {cameraState === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted-background rounded-lg">
                            <ShieldCheckIcon className="w-16 h-16 text-brand-primary mb-4" />
                             <h3 className="text-xl font-bold">Ready to Verify</h3>
                             <p className="text-text-secondary">Enable your camera or upload a video to begin.</p>
                        </div>
                    )}
                     {cameraState === 'recording' && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full animate-pulse">Recording...</div>
                    )}
                    {(cameraState === 'recorded' || cameraState === 'upload') && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Preview</div>
                    )}
                </div>

                {error && <p className="text-center text-red-400 mt-2 text-sm">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {cameraState === 'idle' && (
                        <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEnableCamera} className="flex items-center justify-center gap-2 p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold md:col-span-2">
                                <CameraIcon className="w-6 h-6" /> Enable Camera
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleUploadClick} className="flex items-center justify-center gap-2 p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold">
                                <UploadIcon className="w-6 h-6" /> Upload
                            </motion.button>
                        </>
                    )}

                    {cameraState === 'preview' && (
                         <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={cleanup} className="p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold">
                                Cancel
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartRecording} className="md:col-span-2 flex items-center justify-center gap-2 p-4 bg-brand-primary hover:bg-brand-secondary text-primary-foreground rounded-lg font-semibold">
                                <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div> Start Recording
                            </motion.button>
                         </>
                    )}

                     {cameraState === 'recording' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStopRecording} className="md:col-span-3 flex items-center justify-center gap-2 p-4 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-semibold">
                            <StopIcon className="w-6 h-6" /> Stop Recording
                        </motion.button>
                     )}
                    
                    {(cameraState === 'recorded' || cameraState === 'upload') && (
                        <>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={cleanup} className="p-4 bg-muted-background hover:bg-muted-hover-background rounded-lg font-semibold">
                                Start Over
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAnalyze}
                                disabled={!videoFile || cameraState === 'recording'}
                                className="md:col-span-2 p-4 bg-brand-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <ShieldCheckIcon className="w-6 h-6" /> Analyze
                            </motion.button>
                        </>
                    )}
                    
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