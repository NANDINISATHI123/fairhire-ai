import { supabase } from './supabaseClient';
import { Skill, PeerBenchmark } from '../types';

export const calculatePeerBenchmark = async (jobRole: string, currentSkills: Skill[]): Promise<PeerBenchmark[]> => {
    try {
        // Step 1: Fetch historical interviews for the same job role from Supabase.
        const { data: pastInterviews, error } = await supabase
            .from('interviews')
            .select('skills')
            .eq('job_title', jobRole);

        if (error) throw error;

        // Step 2: If no historical data exists, return a default benchmark to avoid blocking the user.
        if (!pastInterviews || pastInterviews.length === 0) {
            return currentSkills.map(s => ({ skill: s.skill, level: s.level, peerAverage: 60 }));
        }

        // Step 3: Aggregate all skills from the historical records.
        const allSkills: Skill[] = pastInterviews.flatMap((interview: any) => interview.skills || []);
        
        const skillAverages: { [key: string]: { total: number, count: number } } = {};

        allSkills.forEach(skill => {
            if (!skillAverages[skill.skill]) {
                skillAverages[skill.skill] = { total: 0, count: 0 };
            }
            if (typeof skill.level === 'number') {
                skillAverages[skill.skill].total += skill.level;
                skillAverages[skill.skill].count += 1;
            }
        });

        // Step 4: Map the current candidate's skills to the calculated averages.
        return currentSkills.map(s => {
            const avgData = skillAverages[s.skill];
            return {
                skill: s.skill,
                level: s.level,
                // Provide a default average if a specific skill has no historical data.
                peerAverage: avgData && avgData.count > 0 ? Math.round(avgData.total / avgData.count) : 60,
            };
        });
    } catch (err) {
        console.error("Error calculating peer benchmark:", err);
        // On error, return a default benchmark to ensure the interview process is not blocked.
        return currentSkills.map(s => ({ skill: s.skill, level: s.level, peerAverage: 60 }));
    }
};

export const fetchHistoricalSkills = async (userId: string): Promise<{ skill: string, scores: { date: string, score: number }[] }[]> => {
    try {
        const { data, error } = await supabase
            .from('interviews')
            .select('created_at, skills')
            .eq('candidate_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const skillHistory: { [key: string]: { date: string, score: number }[] } = {};

        data.forEach(interview => {
           if (Array.isArray(interview.skills)) {
                interview.skills.forEach((skill: Skill) => {
                    if (!skillHistory[skill.skill]) {
                        skillHistory[skill.skill] = [];
                    }
                    skillHistory[skill.skill].push({
                        date: new Date(interview.created_at).toLocaleDateString(),
                        score: skill.level
                    });
                });
           }
        });
        
        return Object.entries(skillHistory).map(([skill, scores]) => ({ skill, scores }));
    } catch (err) {
        console.error("Error fetching historical skills:", err);
        return [];
    }
};