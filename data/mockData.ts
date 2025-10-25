
export const mockDashboardData = {
    summary: {
        candidatesScreened: 1240,
        biasAlerts: 3,
        modelAccuracy: 96,
        fairnessScore: 92,
    },
    decisions: [
        {
            id: 1,
            candidateName: 'John Doe',
            fitScore: 88,
            confidence: 95,
            explanation: "The model scored John highly based on his 10+ years of experience in cloud architecture and specific certifications in AWS and Azure, which directly align with the senior role's requirements. The decision was not influenced by demographic data.",
        },
        {
            id: 2,
            candidateName: 'Jane Smith',
            fitScore: 75,
            confidence: 89,
            explanation: "Jane's strong project management skills were weighted positively. The lower score compared to other candidates is due to a lack of direct experience with Python, a key requirement listed in the job description.",
        },
        {
            id: 3,
            candidateName: 'Peter Jones',
            fitScore: 62,
            confidence: 85,
            explanation: "Peter has a strong educational background, but the model flagged a potential mismatch in hands-on experience for a senior-level position. The primary factor was the limited scope of projects listed on his resume.",
        },
        {
            id: 4,
            candidateName: 'Emily White',
            fitScore: 92,
            confidence: 98,
            explanation: "Emily's profile is an excellent match. The model highlighted her contributions to open-source projects and her leadership experience in a similar-sized team, indicating a high probability of success in the role.",
        },
    ],
    hiringAnalytics: [
        { name: 'Male', hired: 45, rejected: 120 },
        { name: 'Female', hired: 42, rejected: 115 },
        { name: 'Other', hired: 5, rejected: 15 },
        { name: '20-30', hired: 30, rejected: 80 },
        { name: '31-40', hired: 50, rejected: 130 },
        { name: '41+', hired: 12, rejected: 40 },
    ],
    fairnessDrift: [
        { month: 'Jan', score: 94 },
        { month: 'Feb', score: 95 },
        { month: 'Mar', score: 93 },
        { month: 'Apr', score: 91 },
        { month: 'May', score: 92 },
        { month: 'Jun', score: 92 },
    ],
    employees: [
        { id: 101, name: 'Michael Scott', role: 'Regional Manager', performance: 85, salary: 80000 },
        { id: 102, name: 'Dwight Schrute', role: 'Salesman', performance: 98, salary: 65000 },
        { id: 103, name: 'Jim Halpert', role: 'Salesman', performance: 95, salary: 65000 },
        { id: 104, name: 'Pam Beesly', role: 'Office Administrator', performance: 92, salary: 50000 },
        { id: 105, name: 'Angela Martin', role: 'Accountant', performance: 88, salary: 58000 },
    ]
};
