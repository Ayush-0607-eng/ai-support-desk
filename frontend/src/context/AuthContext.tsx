import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "../types";
import * as authApi from "../api/auth";
import { connectSocket, disconnectSocket } from "../socket";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerOrganization: (name: string, email: string, password: string, organizationName: string) => Promise<void>;
  registerAgent: (name: string, email: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      setUser(JSON.parse(stored));
      connectSocket(token);
    }
    setLoading(false);
  }, []);

  const persist = (data: User) => {
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    connectSocket(data.token || "");
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    persist(data);
  };

  const registerOrganization = async (name: string, email: string, password: string, organizationName: string) => {
    const data = await authApi.registerOrganization(name, email, password, organizationName);
    persist(data);
  };

  const registerAgent = async (name: string, email: string, password: string, inviteCode: string) => {
    const data = await authApi.registerAgent(name, email, password, inviteCode);
    persist(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    disconnectSocket();
  };

  return <AuthContext.Provider value={{ user, loading, login, registerOrganization, registerAgent, logout }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
