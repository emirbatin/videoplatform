import axios from 'axios';
const API_URL = import.meta.env.VITE_SERVER_URL;

const API = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

// Request interceptor - for token handling
API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response interceptor - when token expires
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const login = (userData) => API.post('/auth/login', userData);
export const register = (userData) => API.post('/auth/register', userData);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (userData) => API.put('/auth/profile', userData);

// Video functions
export const getVideos = (page = 1, limit = 8, category = null) => {
  const params = new URLSearchParams({ 
    page, 
    limit,
    ...(category && { category })
  });
  return API.get(`/videos?${params}`);
};

export const getVideoById = (id) => API.get(`/videos/${id}`);

export const incrementView = (id) => {
  return API.post(`/videos/${id}/view`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error incrementing view:', error);
      throw error;
    });
};

export const incrementLike = (id) => {
  return API.post(`/videos/${id}/like`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error incrementing like:', error);
      throw error;
    });
};

export const incrementShare = (id) => {
  return API.post(`/videos/${id}/share`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error incrementing share:', error);
      throw error;
    });
};

export const getFeaturedVideo = () => API.get('/videos/featured');

// Search and categories
export const searchVideos = ({
  q = '',              // search term
  page = 1,            // page number
  limit = 8,           // number of videos per page
  sortBy = 'date',     // sorting criterion
  category = '',       // category filter
  platform = '',       // platform filter
  quality = '',        // quality filter
  timeRange = ''       // time range
} = {}) => {
  const params = new URLSearchParams();

  if (q) params.append('q', q);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (category) params.append('category', category);
  if (platform) params.append('platform', platform);
  if (quality) params.append('quality', quality);
  if (timeRange) params.append('timeRange', timeRange);

  return API.get(`/videos/search?${params}`);
};

// Static options
export const SORT_OPTIONS = {
  DATE: 'date',
  OLDEST: 'oldest',
  VIEWS: 'views',
  LIKES: 'likes',
  DOWNLOADS: 'downloads'
};

export const TIME_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

export const QUALITY_OPTIONS = {
  '4K': '4K',
  'FHD': '1080p',
  'HD': '720p',
  'SD': '480p'
};

// Category functions
export const getVideosByCategory = (categoryId, page = 1, limit = 8) => {
  const params = new URLSearchParams({ page, limit });
  return API.get(`/videos/category/${categoryId}?${params}`);
};

export const getPopularCategories = () => API.get('/categories/popular');

// Admin functions
export const addVideo = (videoData) => API.post('/videos/create', videoData);
export const updateVideo = (id, videoData) => API.put(`/videos/update/${id}`, videoData);
export const deleteVideo = async (id) => {
  console.log("Deleting video with API call, ID:", id); // Check ID here
  return API.delete(`/videos/delete/${id}`);
};


// Key functions
export const generateKey = () => API.get('/keys/generate');
export const verifyKey = (keyData) => API.post('/keys/verify', keyData);
export const getAllKeys = (page = 1, limit = 10) => {
  const params = new URLSearchParams({ page, limit });
  return API.get(`/keys?${params}`);
};

// Error handler
const handleError = (error) => {
  console.error('API Error:', error.response || error);
  throw error;
};

// Helper functions
export const getAuthHeader = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const clearAuth = () => {
  localStorage.removeItem('user');
};
