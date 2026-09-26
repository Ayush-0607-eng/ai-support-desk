import api from "./axios";
import { Ticket, DashboardStats } from "../types";

export const getTickets = async (params?: Record<string, string>): Promise<Ticket[]> => {
  const { data } = await api.get("/tickets", { params });
  return data;
};

export const getTicket = async (id: string): Promise<Ticket> => {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
};

export const createTicket = async (payload: Partial<Ticket>): Promise<Ticket> => {
  const { data } = await api.post("/tickets", payload);
  return data;
};

export const updateTicket = async (id: string, payload: Partial<Ticket>): Promise<Ticket> => {
  const { data } = await api.put(`/tickets/${id}`, payload);
  return data;
};

export const assignAgents = async (id: string, agentIds: string[]): Promise<Ticket> => {
  const { data } = await api.put(`/tickets/${id}/assign`, { agentIds });
  return data;
};

export const deleteTicket = async (id: string): Promise<void> => {
  await api.delete(`/tickets/${id}`);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/tickets/stats/dashboard");
  return data;
};
