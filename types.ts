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

export interface Interview {
    id: string;
    createdAt: string;
    candidateName: string;
    jobRole: string;
    skills: Skill[];
    transcript: Message[];
    summary: string;
    overallScore: number;
    userId: string;
}