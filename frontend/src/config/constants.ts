export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      PROFILE: '/api/auth/profile',
      UPDATE_PROFILE: '/api/auth/update-profile'
    },
    USERS: {
      ALL: '/api/auth/users',
      BY_EMAIL: (email: string) => `/api/auth/user-by-email/${email}`
    },
    CONVERSATIONS: {
      ALL: '/api/conversations',
      CREATE: '/api/conversations',
      MESSAGES: (id: string) => `/api/conversations/${id}/messages`,
      SEND_MESSAGE: (id: string) => `/api/conversations/${id}/messages`
    }
  }
};

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  USER_JOIN: 'user:join',
  USER_LEAVE: 'user:leave',
  USERS_ONLINE: 'users:online',
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_SEEN: 'message:seen',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave'
} as const;
