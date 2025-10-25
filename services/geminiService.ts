

import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Skill, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const textToSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a professional and clear voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error in textToSpeech:", error);
        throw error;
    }
};

export const generateInterviewQuestion = async (jobRole: string, skills: Skill[], previousContext: string): Promise<string> => {
    try {
        const skillText = skills.map(s => `${s.skill} (Proficiency: ${s.level}/100)`).join(', ');
        const response = await ai.models.generateContent({
            // FIX: Updated deprecated model name from gemini-pro to gemini-2.5-pro.
            model: "gemini-2.5-pro",
            contents: `Based on the job role of "${jobRole}", the candidate's skills (${skillText}), and the previous conversation context below, generate a single, relevant, open-ended interview question.
            
            Context:
            ${previousContext}
            `,
            config: {
                systemInstruction: "You are an expert interviewer for technical and behavioral roles. Your questions should be insightful and encourage detailed responses. Do not repeat questions. Only return the question itself.",
                temperature: 0.8,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw error;
    }
};

export const evaluateAnswer = async (question: string, answer: string): Promise<{ feedback: string, score: number, confidence: number }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A candidate was asked the following interview question: "${question}". They provided this answer: "${answer}". 
            
            Please evaluate their answer based on clarity, relevance, and depth. Provide:
            1. A short, constructive feedback sentence (max 20 words).
            2. A score for their answer from 0 to 100.
            3. A confidence score (0-100) based on the answer's certainty and detail.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        confidence: { type: Type.NUMBER }
                    },
                    required: ["feedback", "score", "confidence"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error evaluating answer:", error);
        return { feedback: "Could not evaluate the answer at this time.", score: 50, confidence: 50 };
    }
};

export const generateSummary = async (transcript: Message[]): Promise<string> => {
    try {
        const transcriptText = transcript.map(m => `${m.sender}: ${m.text}`).join('\n');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following interview transcript, please generate a concise summary (2-3 sentences) of the candidate's performance, highlighting strengths and areas for improvement.
            
            Transcript:
            ${transcriptText}`,
            config: {
                systemInstruction: "You are an expert HR analyst. Your summary should be professional, balanced, and directly based on the provided transcript."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Could not generate a summary for this interview.";
    }
}

export const analyzeResume = async (resumeText: string): Promise<Skill[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following resume text and extract the candidate's top 5-7 skills. For each skill, provide a proficiency level from 0 to 100 based on the experience described, and a brief justification.
            
            Resume:
            ${resumeText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skills: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: {
                                        type: Type.STRING,
                                        description: "The name of the skill, e.g., 'React', 'Project Management'."
                                    },
                                    level: {
                                        type: Type.NUMBER,
                                        description: "The proficiency level from 0 to 100."
                                    },
                                    justification: {
                                        type: Type.STRING,
                                        description: "A brief justification for the assigned level."
                                    }
                                },
                                required: ["skill", "level", "justification"]
                            }
                        }
                    },
                    required: ["skills"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text.trim());
        return jsonResponse.skills || [];

    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw error;
    }
};