export type Language = 'en' | 'es' | 'hi' | 'te' | 'fr' | 'de' | 'zh';

export type UserRole = 'candidate' | 'hr_admin';

export interface Skill {
    skill: string;
    level: number;
    justification: string;
}

export interface MessageFeedback {
    feedback: string;
    score: number;
    confidence: number;
}

export interface Message {
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    feedback?: MessageFeedback;
}

export interface PeerBenchmark {
    skill: string;
    level: number;
    peerAverage: number;
}

export interface Interview {
    id: string;
    created_at: string;
    candidate_name: string;
    job_title: string;
    skills: Skill[];
    transcript: Message[];
    summary: string;
    overall_score: number;
    candidate_id: string;
    confidence_scores: number[];
    badges: string[];
    peer_benchmark: PeerBenchmark[];
}