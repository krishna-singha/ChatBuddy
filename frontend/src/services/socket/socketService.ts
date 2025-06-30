import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '../../config/constants';
import type { IMessage } from '../../../../shared/types';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string): Socket {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(API_CONFIG.SOCKET_URL, {
      withCredentials: true,
    });

    this.userId = userId;
    this.socket.emit(SOCKET_EVENTS.USER_JOIN, userId);

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      if (this.userId) {
        this.socket.emit(SOCKET_EVENTS.USER_LEAVE, this.userId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Message events
  sendMessage(message: IMessage): void {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, message);
  }

  onMessageReceive(callback: (message: IMessage) => void): void {
    this.socket?.on(SOCKET_EVENTS.MESSAGE_RECEIVE, callback);
  }

  markMessageAsSeen(messageId: string, userId: string): void {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEEN, messageId, userId);
  }

  // Typing events
  startTyping(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, conversationId);
  }

  onTypingStart(callback: (conversationId: string, userName: string) => void): void {
    this.socket?.on(SOCKET_EVENTS.TYPING_START, callback);
  }

  onTypingStop(callback: (conversationId: string, userName: string) => void): void {
    this.socket?.on(SOCKET_EVENTS.TYPING_STOP, callback);
  }

  // User events
  onUsersOnline(callback: (userIds: string[]) => void): void {
    this.socket?.on(SOCKET_EVENTS.USERS_ONLINE, callback);
  }

  // Conversation events
  joinConversation(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
  }

  // General event handlers
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
