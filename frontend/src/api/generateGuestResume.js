// src/api/generateGuestResume.js
import { API_CONFIG } from './config';

export const generateGuestResume = async ({ resumeData }) => {

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/generate/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ resumeData }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate guest resume');
    }


    return data;
  } catch (error) {
    console.error('Guest resume generation error:', error);
    throw error;
  }
};
