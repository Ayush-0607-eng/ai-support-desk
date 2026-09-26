import api from "./axios";

export const sendFeedback = async (messageId: string, ticketId: string, rating: "helpful" | "not_helpful", comment = "") => {
  const { data } = await api.post("/feedback", { messageId, ticketId, rating, comment });
  return data;
};
