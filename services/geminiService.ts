import { GoogleGenAI, Modality, Type } from "@google/genai";
// FIX: Imported MessageFeedback type for the new evaluateAnswer function.
import { Skill, Message, MessageFeedback } from "../types";

const apiKey = process.env.VITE_API_KEY;
if (!apiKey) {
    throw new Error("Gemini API key is missing. Ensure VITE_API_KEY is set in your .env file.");
}

// FIX: The API key must be obtained from process.env.API_KEY per the guidelines.
const ai = new GoogleGenAI({ apiKey });

export const textToSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
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
            
            ---
            New Question:`,
        });
        // FIX: Added missing return statement to resolve the function error.
        return response.text;
    } catch (error) {
        console.error("Error generating interview question:", error);
        throw error;
    }
};

// FIX: Implemented missing function `analyzeResume` to resolve import error in Interview.tsx.
export const analyzeResume = async (resumeText: string): Promise<Skill[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following resume text and extract the top 5-7 technical and soft skills. For each skill, provide a proficiency level from 1-100 based on the resume content, and a brief justification for your assessment.
            
            Resume:
            ---
            ${resumeText}
            ---
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            skill: {
                                type: Type.STRING,
                                description: "The name of the skill identified."
                            },
                            level: {
                                type: Type.NUMBER,
                                description: "The proficiency level from 1 to 100."
                            },
                            justification: {
                                type: Type.STRING,
                                description: "A brief justification for the proficiency level based on the resume."
                            }
                        },
                        required: ["skill", "level", "justification"]
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        const skills = JSON.parse(jsonStr);
        return skills;
    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw error;
    }
};

// FIX: Implemented missing function `evaluateAnswer` to resolve import error in Interview.tsx.
export const evaluateAnswer = async (question: string, answer: string): Promise<MessageFeedback> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Evaluate the candidate's answer to the interview question. Provide constructive feedback, a score from 0 to 100 on how well they answered, and a confidence level for your score.
            
            Question: "${question}"
            Answer: "${answer}"
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedback: {
                            type: Type.STRING,
                            description: "Constructive feedback on the candidate's answer."
                        },
                        score: {
                            type: Type.NUMBER,
                            description: "A score from 0 to 100 for the answer."
                        },
                        confidence: {
                            type: Type.NUMBER,
                            description: "A confidence level from 0 to 100 for the assigned score."
                        }
                    },
                    required: ["feedback", "score", "confidence"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const feedback = JSON.parse(jsonStr);
        return feedback;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw error;
    }
};

// FIX: Implemented missing function `generateSummary` to resolve import error in Interview.tsx.
export const generateSummary = async (transcript: Message[]): Promise<string> => {
    try {
        const transcriptText = transcript.map(m => `${m.sender === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`).join('\n');
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Based on the following interview transcript, write a concise summary of the candidate's performance. Highlight their strengths and weaknesses based on their answers.
            
            Transcript:
            ---
            ${transcriptText}
            ---
            Summary:`,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw error;
    }
};