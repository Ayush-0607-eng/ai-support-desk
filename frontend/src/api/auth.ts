import api from "./axios";
import { User } from "../types";

export const registerOrganization = async (name: string, email: string, password: string, organizationName: string): Promise<User> => {
  const { data } = await api.post("/auth/register-organization", { name, email, password, organizationName });
  return data;
};

export const registerAgent = async (name: string, email: string, password: string, inviteCode: string): Promise<User> => {
  const { data } = await api.post("/auth/register-agent", { name, email, password, inviteCode });
  return data;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const getAgents = async (): Promise<User[]> => {
  const { data } = await api.get("/auth/agents");
  return data;
};
