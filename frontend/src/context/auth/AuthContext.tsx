import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import type { ReactNode } from "react";
import type { IUser } from "../../interfaces";
import type { AuthContextType } from "../../interfaces/context";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = BACKEND_URL;

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("token")); // Loading if token exists
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketInitialized = useRef(false);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        connectSocket(data.user);
      }
    } catch (error) {
      logout();
      toast.error("Session expired. Please log in again.");
    } finally {
      setIsLoading(false);
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
    }
    catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed.";
      toast.error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setAuthUser(null);
    setIsLoading(false);
    setOnlineUsers([]);
    socket?.disconnect();
    setSocket(null);
    socketInitialized.current = false;
    toast.success("Logged out successfully.");
  };

  const updateProfile = async (profileData: any) => {
    try {
      const { data } = await axios.put("/api/auth/profile", profileData);
      if (data.success) {
        setAuthUser(data.user);
        // Don't show toast here as Profile component handles it
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    }
  };

  const connectSocket = (user: IUser) => {
    if (!user || socketInitialized.current) return;

    socketInitialized.current = true;
    const newSocket = io(BACKEND_URL, {
      query: { userId: user._id },
      transports: ['websocket'],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
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
      setIsLoading(false);
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
