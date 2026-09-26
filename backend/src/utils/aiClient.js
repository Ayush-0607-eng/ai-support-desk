import axios from "axios";
import logger from "../config/logger.js";

const aiApi = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  timeout: 60000,
  headers: { "x-api-key": process.env.AI_SERVICE_API_KEY }
});

export const ingestDocument = async (title, content, docId, orgId) => {
  const { data } = await aiApi.post("/ingest", { title, content, doc_id: docId, org_id: orgId });
  return data;
};

export const deleteDocument = async (docId) => {
  const { data } = await aiApi.delete(`/documents/${docId}`);
  return data;
};

export const queryRag = async (question, ticketContext, orgId) => {
  try {
    const { data } = await aiApi.post("/query", { question, context: ticketContext, org_id: orgId });
    return data;
  } catch (error) {
    logger.error(`AI service query failed: ${error.message}`);
    throw new Error("AI service is currently unavailable");
  }
};

export default aiApi;
