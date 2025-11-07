// api/atsService.js
import { API_CONFIG } from './config';

export const evaluateATS = async ({ resumeText, jobDescription, user }) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (user) {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_CONFIG.baseUrl}/ats-evaluate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                resumeText,
                jobDescription
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to evaluate ATS score');
        }

        return data;
    } catch (error) {
        console.error('ATS evaluation error:', error);
        throw error;
    }
};