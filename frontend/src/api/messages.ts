import api from "./axios";
import { Message } from "../types";

export const getMessages = async (ticketId: string): Promise<Message[]> => {
  const { data } = await api.get(`/messages/${ticketId}`);
  return data;
};

export const sendMessage = async (ticketId: string, content: string, sender = "agent"): Promise<Message> => {
  const { data } = await api.post(`/messages/${ticketId}`, { content, sender });
  return data;
};

export const generateAiDraft = async (ticketId: string, question?: string): Promise<Message> => {
  const { data } = await api.post(`/messages/${ticketId}/ai-draft`, { question });
  return data;
};

export const approveDraft = async (messageId: string): Promise<Message> => {
  const { data } = await api.put(`/messages/draft/${messageId}/approve`);
  return data;
};
