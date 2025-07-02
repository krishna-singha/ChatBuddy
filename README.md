# 💬 ChatBuddy - Modern Real-time Chat Application

A feature-rich, real-time chat application built with React, Node.js, TypeScript, and Socket.IO. ChatBuddy provides seamless individual and group messaging with a modern, responsive UI.

## ✨ Features

- 🔐 **Authentication** - Secure login/register with JWT
- 💬 **Real-time Messaging** - Instant messaging with Socket.IO
- 👥 **Group Chats** - Create and manage group conversations
- 👤 **User Profiles** - Customizable profiles with avatars and bio
- 🔔 **Live Notifications** - Unseen message counts and notifications
- ⌨️ **Typing Indicators** - See when someone is typing
- ✅ **Read Receipts** - Message delivery and read status
- 🟢 **Online Status** - Real-time user online/offline status
- 🔍 **Search** - Search conversations and messages
- 🎨 **Modern UI** - Beautiful, responsive design with blur effects
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatBuddy
   ```

2. **Start development environment**
   ```bash
   # Quick setup for new developers
   make quickstart
   
   # Or use the convenient dev command
   make dev
   
   # Or start manually:
   # Backend
   cd backend && npm install && npm run dev
   
   # Frontend (in another terminal)
   cd frontend && npm install && npm run dev
   ```

3. **Environment Setup**
   
   Create `.env` files:
   
   **Backend** (`backend/.env`):
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/chatbuddy
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SOCKET_URL=http://localhost:8000
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## 🛠️ Development

### Scripts

**Using Makefile (Recommended):**
```bash
make help           # Show all available commands
make install        # Install all dependencies
make dev            # Start both frontend and backend
make build          # Build for production
make test           # Run all tests
make clean          # Clean build artifacts
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
```

### Code Organization

#### Frontend Components
- **`components/chat/`** - Core chat functionality
- **`components/modals/`** - Modal dialogs
- **`components/ui/`** - Reusable UI elements
- **`components/layout/`** - Layout components
- **`components/common/`** - Shared components

#### Context Management
- **`context/auth/`** - Authentication state
- **`context/chat/`** - Chat state and real-time updates

#### Services
- **`services/api/`** - HTTP API calls
- **`services/socket/`** - Socket.IO client management

### Backend Structure
- **`controllers/`** - Request handling logic
- **`models/`** - MongoDB schemas
- **`routes/`** - API route definitions
- **`socket/`** - Real-time event handlers
- **`middleware/`** - Authentication & validation

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Blur Effects** - Beautiful backdrop blur on modals
- **Smooth Animations** - Framer Motion animations
- **Responsive Layout** - Mobile-first design
- **Dark Theme** - Elegant dark color scheme
- **Status Indicators** - Online/offline and typing status
- **Message Bubbles** - Distinguished sent/received messages

## 🔧 Technical Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Socket.IO Client (real-time)
- React Router (navigation)
- React Hot Toast (notifications)

**Backend:**
- Node.js + Express
- TypeScript
- Socket.IO (real-time)
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (image uploads)
- Bcrypt (password hashing)

## 📱 Features in Detail

### Real-time Messaging
- Instant message delivery via Socket.IO
- Message status indicators (sent, delivered, read)
- Typing indicators show when users are composing
- Online/offline status tracking

### Group Chats
- Create groups with multiple participants
- Admin controls for group management
- Add/remove members to existing groups
- Group-specific chat interfaces
- Participant management

### User Management
- Profile customization with avatars
- Bio and personal information
- User discovery and friend connections
- Privacy controls

### Modern UI
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive navigation and user flow
- Accessibility considerations

## 🚢 Deployment

### Production Build
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

### Environment Variables
Ensure all production environment variables are set for:
- Database connections
- JWT secrets
- Cloudinary configuration
- CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time functionality
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations
- Cloudinary for image management

---

**Built with ❤️ by Krishna Singha**
