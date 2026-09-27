import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Loader2, User2 } from "lucide-react";
import toast from "react-hot-toast";
import { getTicket, updateTicket, assignAgents } from "../api/tickets";
import { getMessages, sendMessage, generateAiDraft, approveDraft } from "../api/messages";
import { sendFeedback } from "../api/feedback";
import { getAgents } from "../api/auth";
import { Ticket, Message, User } from "../types";
import Loader from "../components/Loader";
import MessageBubble from "../components/MessageBubble";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../socket";

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    const [t, m, a] = await Promise.all([getTicket(id), getMessages(id), getAgents()]);
    setTicket(t);
    setMessages(m);
    setAgents(a);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;
    const onMessage = (payload: { ticketId: string; message: Message }) => {
      if (payload.ticketId !== id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === payload.message._id);
        return exists ? prev.map((m) => (m._id === payload.message._id ? payload.message : m)) : [...prev, payload.message];
      });
    };
    const onTicketUpdated = (updated: Ticket) => {
      if (updated._id === id) setTicket(updated);
    };
    socket.on("message:created", onMessage);
    socket.on("ticket:updated", onTicketUpdated);
    return () => {
      socket.off("message:created", onMessage);
      socket.off("ticket:updated", onTicketUpdated);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canReply = ticket && user ? (user.role === "admin" || (ticket.assignedAgents || []).some((a) => a._id === user.id)) : false;

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !reply.trim()) return;
    setSending(true);
    try {
      await sendMessage(id, reply);
      setReply("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleAiDraft = async () => {
    if (!id) return;
    setDrafting(true);
    try {
      await generateAiDraft(id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "AI draft generation failed");
    } finally {
      setDrafting(false);
    }
  };

  const handleApprove = async (messageId: string) => {
    try {
      await approveDraft(messageId);
      toast.success("Reply sent to customer");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve draft");
    }
  };

  const handleFeedback = async (messageId: string, rating: "helpful" | "not_helpful") => {
    if (!id) return;
    try {
      await sendFeedback(messageId, id, rating);
      toast.success("Feedback recorded");
    } catch {
      toast.error("Failed to record feedback");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id || !ticket) return;
    const updated = await updateTicket(id, { status: status as Ticket["status"] });
    setTicket(updated);
  };

  const handleToggleAgent = async (agentId: string) => {
    if (!id || !ticket) return;
    const current = (ticket.assignedAgents || []).map((a) => a._id);
    const next = current.includes(agentId) ? current.filter((a) => a !== agentId) : [...current, agentId];
    const updated = await assignAgents(id, next);
    setTicket(updated);
  };

  if (loading) return <Loader fullScreen />;
  if (!ticket) return <p className="text-center text-slate-400 py-16">Ticket not found</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-violet-200/40 dark:shadow-black/30 overflow-hidden">
        <div className="p-5 border-b border-violet-50 dark:border-slate-800">
          <Link to="/tickets" className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-3">
            <ArrowLeft size={16} /> Back to tickets
          </Link>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[55vh]">
          {messages.map((m) => <MessageBubble key={m._id} message={m} onApprove={canReply ? handleApprove : undefined} onFeedback={handleFeedback} />)}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-violet-50 dark:border-slate-800 space-y-3">
          {canReply ? (
            <>
              <button onClick={handleAiDraft} disabled={drafting} className="w-full flex items-center justify-center gap-2 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-medium py-2.5 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors duration-200 disabled:opacity-60">
                {drafting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate AI draft reply
              </button>
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply" className="flex-1 px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <button type="submit" disabled={sending} className="p-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-200 disabled:opacity-60">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </>
          ) : (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-2">You are not assigned to this ticket. Only the admin or assigned agents can reply.</p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Customer</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300">
              <User2 size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ticket.customerName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.customerEmail}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{ticket.description}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Ticket settings</h2>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
            {canReply ? (
              <select value={ticket.status} onChange={(e) => handleStatusChange(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 capitalize">{ticket.status}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned agents</label>
            {user?.role === "admin" ? (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {agents.length === 0 && <p className="text-xs text-slate-400">No agents in your workspace yet</p>}
                {agents.map((a) => {
                  const checked = (ticket.assignedAgents || []).some((x) => x._id === a.id);
                  return (
                    <label key={a.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => handleToggleAgent(a.id)} className="rounded border-violet-300 text-violet-600 focus:ring-violet-400" />
                      {a.name}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{(ticket.assignedAgents || []).map((a) => a.name).join(", ") || "Unassigned"}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 capitalize">{ticket.category}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
