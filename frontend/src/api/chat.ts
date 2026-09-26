import api from "./axios";
import { ChatMessage } from "../types";

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  const { data } = await api.get("/chat");
  return data;
};
