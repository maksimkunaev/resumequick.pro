export const isDevelopment = process.env.NODE_ENV === 'development';
// Payment API key removed - not needed for free service

export const API_CONFIG = {
  baseUrl: isDevelopment ? 'http://localhost:8000' : '',
  endpoints: {
    legalConfig: '/legal-config',
    privacy: '/privacy_policy.html',
    terms: '/terms.html',
    refund_policy: '/refund_policy.html'
  }
};


export const BASE_URL = API_CONFIG.baseUrl