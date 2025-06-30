import { API_CONFIG } from '../../config/constants';
import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const authService = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
  
  logout: () =>
    apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
  
  getProfile: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE),
  
  updateProfile: (data: { name?: string; bio?: string; avatar?: string; avatarPublicId?: string }) =>
    apiClient.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, data),
};

export const userService = {
  getAllUsers: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.USERS.ALL),
  
  getUserByEmail: (email: string) =>
    apiClient.get(API_CONFIG.ENDPOINTS.USERS.BY_EMAIL(email)),
};

export const conversationService = {
  getConversations: () =>
    apiClient.get(API_CONFIG.ENDPOINTS.CONVERSATIONS.ALL),
  
  createConversation: (data: { participants: string[]; isGroup?: boolean; name?: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.CONVERSATIONS.CREATE, data),
  
  getMessages: (conversationId: string) =>
    apiClient.get(API_CONFIG.ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)),
  
  sendMessage: (conversationId: string, data: { text?: string; image?: string }) =>
    apiClient.post(API_CONFIG.ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId), data),
};
