import { useEffect, useState, FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { getTickets } from "../api/tickets";
import { Ticket } from "../types";
import TicketCard from "../components/TicketCard";
import CreateTicketModal from "../components/CreateTicketModal";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../socket";

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const data = await getTickets(params);
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [status, priority]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => loadTickets();
    socket.on("ticket:created", refresh);
    socket.on("ticket:updated", refresh);
    return () => {
      socket.off("ticket:created", refresh);
      socket.off("ticket:updated", refresh);
    };
  }, [status, priority, search]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    loadTickets();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors duration-200">
            <Plus size={18} /> New ticket
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
        </form>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? <Loader /> : tickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500">No tickets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} />)}
        </div>
      )}

      {modalOpen && <CreateTicketModal onClose={() => setModalOpen(false)} onCreated={loadTickets} />}
    </div>
  );
};

export default Tickets;
