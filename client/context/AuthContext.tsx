import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import type { ReactNode } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarPublicId?: string;
  bio?: string;
}

interface AuthContextType {
  authUser: User | null;
  onlineUsers: string[];
  socket: Socket | null;
  login: (state: "login" | "register", credentials: Record<string, string>) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  axios: typeof axios;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketInitialized = useRef(false); // 👈 Prevent multiple socket connects

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        connectSocket(data.user);
      }
    } catch (error) {
      logout();
      toast.error("Session expired. Please log in again.");
    }
  };

  const login = async (
    state: "login" | "register",
    credentials: Record<string, string>
  ) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setToken(data.token);
        setAuthUser(data.userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("token", data.token);
        connectSocket(data.userData);
        toast.success(data.messages);
      } else {
        toast.error(data.messages);
      }
    } catch {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    socket?.disconnect();
    setSocket(null);
    socketInitialized.current = false; // 👈 Reset on logout
    toast.success("Logged out successfully.");
  };

  const updateProfile = async (profileData: any) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", profileData);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully.");
      } else {
        toast.error(data.messages);
      }
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const connectSocket = (user: User) => {
    if (!user || socketInitialized.current) return;

    socketInitialized.current = true; // ✅ Prevent duplicate
    const newSocket = io(BACKEND_URL, {
      query: { userId: user._id },
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    } else {
      setAuthUser(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const value: AuthContextType = {
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    axios,
  };

  return (
    <AuthContext.Provider value={value}>
      {token && authUser === null ? null : children}
    </AuthContext.Provider>
  );
};
