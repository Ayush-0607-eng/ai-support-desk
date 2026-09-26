import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Ticket } from "../types";
import { StatusBadge, PriorityBadge } from "./StatusBadge";

const TicketCard = ({ ticket }: { ticket: Ticket }) => {
  const agentNames = ticket.assignedAgents && ticket.assignedAgents.length > 0 ? ticket.assignedAgents.map((a) => a.name).join(", ") : "Unassigned";

  return (
    <Link to={`/tickets/${ticket._id}`} className="block bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-300/50 dark:hover:shadow-violet-900/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-1">{ticket.subject}</h3>
        <PriorityBadge priority={ticket.priority} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{ticket.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <span className="text-xs text-slate-400 dark:text-slate-500">{ticket.category}</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-violet-50 dark:border-slate-800 pt-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">{ticket.customerName}</span>
        <span className="text-xs font-medium text-violet-600 dark:text-violet-400 truncate max-w-[150px]">{agentNames}</span>
      </div>
    </Link>
  );
};

export default TicketCard;
