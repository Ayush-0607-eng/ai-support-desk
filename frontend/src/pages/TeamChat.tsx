import { useEffect, useRef, useState, FormEvent } from "react";
import { Send } from "lucide-react";
import { getChatMessages } from "../api/chat";
import { ChatMessage } from "../types";
import { getSocket } from "../socket";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import Loader from "../components/Loader";

const TeamChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatMessages().then(setMessages).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMessage = (message: ChatMessage) => setMessages((prev) => [...prev, message]);
    socket.on("chat:message", onMessage);
    return () => {
      socket.off("chat:message", onMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !text.trim()) return;
    socket.emit("chat:send", { content: text }, () => {});
    setText("");
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-violet-200/40 dark:shadow-black/30 overflow-hidden">
      <div className="p-5 border-b border-violet-50 dark:border-slate-800">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Team chat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Chat with everyone in your workspace, in real time</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No messages yet, say hello</p>}
        {messages.map((m) => {
          const mine = m.author._id === user?.id;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"} animate-slideup`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? "bg-violet-600 text-white" : "bg-violet-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                <p className={`mt-1 text-[11px] ${mine ? "text-violet-200" : "text-slate-400 dark:text-slate-500"}`}>{m.author.name} · {m.author.role} · {format(new Date(m.createdAt), "h:mm a")}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-violet-50 dark:border-slate-800 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message your team" className="flex-1 px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        <button type="submit" className="p-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-200">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
