import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Clock, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getDashboardStats } from "../api/tickets";
import { DashboardStats } from "../types";
import Loader from "../components/Loader";
import CreateTicketModal from "../components/CreateTicketModal";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../socket";

const STATUS_COLORS = ["#10b981", "#f59e0b", "#0ea5e9", "#64748b"];
const PRIORITY_COLORS = ["#94a3b8", "#7c3aed", "#f97316", "#f43f5e"];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("ticket:created", load);
    socket.on("ticket:updated", load);
    return () => {
      socket.off("ticket:created", load);
      socket.off("ticket:updated", load);
    };
  }, []);

  if (loading) return <Loader fullScreen />;
  if (!stats) return null;

  const cards = [
    { label: "Total tickets", value: stats.total, icon: Inbox, color: "from-violet-500 to-violet-700" },
    { label: "Open", value: stats.open, icon: Inbox, color: "from-emerald-400 to-emerald-600" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "from-amber-400 to-amber-600" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "from-sky-400 to-sky-600" }
  ];

  const statusData = [
    { name: "Open", value: stats.byStatus.open },
    { name: "Pending", value: stats.byStatus.pending },
    { name: "Resolved", value: stats.byStatus.resolved },
    { name: "Closed", value: stats.byStatus.closed }
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: "Low", value: stats.byPriority.low },
    { name: "Medium", value: stats.byPriority.medium },
    { name: "High", value: stats.byPriority.high },
    { name: "Urgent", value: stats.byPriority.urgent }
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of your support activity</p>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors duration-200">
            <Plus size={18} /> New ticket
          </button>
        )}
      </div>

      {stats.urgent > 0 && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3">
          <AlertTriangle size={18} className="text-rose-500" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{stats.urgent} urgent ticket{stats.urgent > 1 ? "s" : ""} need attention</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-800 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Tickets by status</h2>
          {statusData.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusData.map((_, index) => <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Tickets by urgency</h2>
          {priorityData.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {priorityData.map((_, index) => <Cell key={index} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent tickets</h2>
          <Link to="/tickets" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {stats.recentTickets.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">No tickets yet</p>}
          {stats.recentTickets.map((ticket) => (
            <Link key={ticket._id} to={`/tickets/${ticket._id}`} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors duration-150">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {modalOpen && <CreateTicketModal onClose={() => setModalOpen(false)} onCreated={load} />}
    </div>
  );
};

export default Dashboard;
