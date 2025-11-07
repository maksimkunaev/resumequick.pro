import { API_CONFIG } from './config';

export const generateResume = async ({ resumeData, user }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.baseUrl}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeData }),
    });

    const data = await response.json();


    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate resume');
    }

    return data;
  } catch (error) {
    console.error('Resume generation error:', error);
    throw error;
  }
};
