export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  avatarColor: string;
  organization?: string;
  organizationName?: string;
  inviteCode?: string;
  token?: string;
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  assignedAgents?: { _id: string; name: string; avatarColor: string }[];
  createdBy?: { _id: string; name: string; email: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageSource {
  title: string;
  snippet: string;
  docId: string;
  score: number;
}

export interface Message {
  _id: string;
  ticket: string;
  sender: "customer" | "agent" | "ai";
  author?: { _id: string; name: string; avatarColor: string } | null;
  content: string;
  isDraft: boolean;
  sources: MessageSource[];
  createdAt: string;
}

export interface KnowledgeDoc {
  _id: string;
  title: string;
  content: string;
  sourceType: "manual" | "upload";
  uploadedBy: { _id: string; name: string };
  chunkCount: number;
  status: "processing" | "indexed" | "failed";
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  urgent: number;
  byStatus: { open: number; pending: number; resolved: number; closed: number };
  byPriority: { low: number; medium: number; high: number; urgent: number };
  recentTickets: Ticket[];
}

export interface ChatMessage {
  _id: string;
  author: { _id: string; name: string; avatarColor: string; role: "admin" | "agent" };
  content: string;
  createdAt: string;
}
