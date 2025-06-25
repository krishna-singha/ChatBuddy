// import type { User, Chat, Message } from '../types';

// export const mockUsers: User[] = [
//   {
//     id: 'user1',
//     name: 'Alex Chen',
//     avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
//   {
//     id: 'user2',
//     name: 'Sarah Kim',
//     avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
//   {
//     id: 'user3',
//     name: 'Marcus Johnson',
//     avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'away'
//   },
//   {
//     id: 'user4',
//     name: 'Emma Wilson',
//     avatar: 'https://images.pexels.com/photos/1484783/pexels-photo-1484783.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'offline',
//     lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
//   },
//   {
//     id: 'user5',
//     name: 'David Rodriguez',
//     avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
//   {
//     id: 'user3',
//     name: 'Marcus Johnson',
//     avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'away'
//   },
//   {
//     id: 'user4',
//     name: 'Emma Wilson',
//     avatar: 'https://images.pexels.com/photos/1484783/pexels-photo-1484783.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'offline',
//     lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
//   },
//   {
//     id: 'user5',
//     name: 'David Rodriguez',
//     avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
//   {
//     id: 'user3',
//     name: 'Marcus Johnson',
//     avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'away'
//   },
//   {
//     id: 'user4',
//     name: 'Emma Wilson',
//     avatar: 'https://images.pexels.com/photos/1484783/pexels-photo-1484783.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'offline',
//     lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
//   },
//   {
//     id: 'user5',
//     name: 'David Rodriguez',
//     avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
//   {
//     id: 'user3',
//     name: 'Marcus Johnson',
//     avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'away'
//   },
//   {
//     id: 'user4',
//     name: 'Emma Wilson',
//     avatar: 'https://images.pexels.com/photos/1484783/pexels-photo-1484783.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'offline',
//     lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
//   },
//   {
//     id: 'user5',
//     name: 'David Rodriguez',
//     avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//     status: 'online'
//   },
// ];

// export const currentUser: User = {
//   id: 'current',
//   name: 'You',
//   avatar: 'https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//   status: 'online'
// };

// const generateMockMessages = (chatId: string, participants: User[]): Message[] => {
//   const messages: Message[] = [];
//   const otherUser = participants.find(u => u.id !== currentUser.id);
//   if (!otherUser) return messages;

//   const messageTemplates = [
//     "Hey! How's your day going?",
//     "Just finished a great workout 💪",
//     "Working on some exciting projects lately orking on some exciting projects lately orking on some exciting projects latelyorking on some exciting projects lately orking on some exciting projects lately",
//     "The weather is amazing today!",
//     "Have you seen the latest news?",
//     "Let's catch up soon!",
//     "Hope you're doing well 😊",
//     "Thanks for your help earlier",
//     "Looking forward to the weekend",
//     "This new coffee shop is incredible!"
//   ];

//   for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
//     const isFromCurrentUser = Math.random() > 0.6;
//     const timestamp = new Date(Date.now() - (Math.random() * 86400000 * 7)); // Random time in last week
    
//     messages.push({
//       id: `msg-${chatId}-${i}`,
//       senderId: isFromCurrentUser ? currentUser.id : otherUser.id,
//       content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
//       timestamp,
//       status: isFromCurrentUser ? 'read' : 'sent',
//       type: 'text',
//       reactions: Math.random() > 0.8 ? [
//         { emoji: '❤️', userId: Math.random() > 0.5 ? currentUser.id : otherUser.id, userName: Math.random() > 0.5 ? currentUser.name : otherUser.name }
//       ] : undefined
//     });
//   }

//   return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
// };

// export const mockChats: Chat[] = mockUsers.map((user, index) => ({
//   id: `chat-${user.id}`,
//   participants: [currentUser, user],
//   messages: generateMockMessages(`chat-${user.id}`, [currentUser, user]),
//   unreadCount: Math.floor(Math.random() * 5),
//   isTyping: index === 0 && Math.random() > 0.7,
//   get lastMessage() {
//     return this.messages[this.messages.length - 1];
//   }
// }));