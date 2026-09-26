import api from "./axios";
import { KnowledgeDoc } from "../types";

export const getKnowledgeDocs = async (): Promise<KnowledgeDoc[]> => {
  const { data } = await api.get("/knowledge");
  return data;
};

export const createKnowledgeDoc = async (title: string, content: string): Promise<KnowledgeDoc> => {
  const { data } = await api.post("/knowledge", { title, content });
  return data;
};

export const uploadKnowledgeDoc = async (file: File, title: string): Promise<KnowledgeDoc> => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  const { data } = await api.post("/knowledge/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
};

export const deleteKnowledgeDoc = async (id: string): Promise<void> => {
  await api.delete(`/knowledge/${id}`);
};
