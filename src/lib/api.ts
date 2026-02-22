// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON if body exists
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiCall<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiCall<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  forgotPassword: (email: string) =>
    apiCall<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Plant Disease Scan
  scanPlant: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiCall<{
      disease: string;
      confidence: number;
      recommendations: string[];
      medicines: any[];
    }>('/scan', {
      method: 'POST',
      body: formData,
    });
  },

  // Get user profile
  getProfile: () =>
    apiCall<{ success: boolean; user: any }>('/auth/me', {
      method: 'GET',
    }),

  // Update user profile
  updateProfile: (data: Record<string, any>) =>
    apiCall<{ success: boolean; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Get scan history
  getScanHistory: () =>
    apiCall<{ success: boolean; data: any[] }>('/detect/history', {
      method: 'GET',
    }),

  // Upload profile picture
  uploadProfilePicture: (imageFile: File) => {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    return apiCall<{ success: boolean; user: any; profilePicture: string }>(
      '/auth/profile-picture',
      {
        method: 'PUT',
        body: formData,
      }
    );
  },
};

export default api;
