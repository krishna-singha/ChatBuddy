import { motion } from 'framer-motion';
import { MessageCircle, Users, Zap, Shield, Smile, Image } from 'lucide-react';

const WelcomeScreen = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Messaging",
      description: "Instant message delivery with live typing indicators"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Chats",
      description: "Create group conversations with multiple participants"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Read Receipts",
      description: "Know when your messages are delivered and seen"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "Rich Media",
      description: "Share images seamlessly"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900/60 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl px-8"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <MessageCircle className="w-24 h-24 mx-auto text-cyan-400 mb-4" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20"
            />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            ChatBuddy
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Connect, Chat, and Collaborate
          </p>
          <p className="text-gray-400">
            Select a conversation to start messaging or create a new chat
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="bg-gray-800/40 backdrop-blur-md border border-gray-700/30 rounded-xl p-6 hover:bg-gray-800/60 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg text-cyan-400">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-400 text-sm text-left">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-4 text-gray-400"
        >
          <Smile className="w-5 h-5" />
          <span className="text-sm">
            Start by selecting a conversation from the sidebar or create a new chat
          </span>
          <Smile className="w-5 h-5" />
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              x: [0, -80, 0],
              y: [0, 60, 0],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
