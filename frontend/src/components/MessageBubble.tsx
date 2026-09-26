import { Bot, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { format } from "date-fns";
import { Message } from "../types";

interface Props {
  message: Message;
  onApprove?: (id: string) => void;
  onFeedback?: (id: string, rating: "helpful" | "not_helpful") => void;
}

const MessageBubble = ({ message, onApprove, onFeedback }: Props) => {
  const isCustomer = message.sender === "customer";
  const isAi = message.sender === "ai";

  return (
    <div className={`flex ${isCustomer ? "justify-start" : "justify-end"} animate-slideup`}>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${isCustomer ? "bg-white dark:bg-slate-800 border border-violet-100 dark:border-slate-700" : isAi ? "bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800" : "bg-violet-600 text-white"}`}>
        {isAi && (
          <div className="flex items-center gap-1.5 mb-1.5 text-violet-600 dark:text-violet-300">
            <Bot size={14} />
            <span className="text-xs font-semibold">{message.isDraft ? "AI draft" : "AI assisted"}</span>
          </div>
        )}
        <p className={`text-sm whitespace-pre-wrap ${isCustomer ? "text-slate-700 dark:text-slate-200" : isAi ? "text-slate-700 dark:text-slate-200" : "text-white"}`}>{message.content}</p>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((s, i) => (
              <span key={i} title={s.snippet} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">{s.title}</span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className={`text-[11px] ${isCustomer || isAi ? "text-slate-400 dark:text-slate-500" : "text-violet-200"}`}>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
          {isAi && message.isDraft && onApprove && (
            <button onClick={() => onApprove(message._id)} className="flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-100">
              <Check size={14} /> Approve and send
            </button>
          )}
          {isAi && !message.isDraft && onFeedback && (
            <div className="flex items-center gap-2">
              <button onClick={() => onFeedback(message._id, "helpful")} className="text-emerald-500 hover:text-emerald-700">
                <ThumbsUp size={14} />
              </button>
              <button onClick={() => onFeedback(message._id, "not_helpful")} className="text-rose-500 hover:text-rose-700">
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
