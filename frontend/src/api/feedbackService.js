// api/feedbackService.js
import { API_CONFIG } from './api/config'
const API_URL = API_CONFIG.baseUrl

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_URL}/api/feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit feedback');
    }
    return data;
  } catch (error) {
    console.error('Feedback submission error:', error);
    throw error;
  }
};

export const getFeedbackStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/feedback/stats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Include credentials if using basic auth
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get feedback stats');
    }
    return data;
  } catch (error) {
    console.error('Feedback stats error:', error);
    throw error;
  }
};