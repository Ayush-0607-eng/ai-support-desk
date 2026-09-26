import { NavLink } from "react-router-dom";
import { LayoutDashboard, Ticket, BookOpen, Settings, Sparkles, X, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/knowledge", label: "Knowledge base", icon: BookOpen },
  { to: "/team-chat", label: "Team chat", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings }
];

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user } = useAuth();

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-fadein" />}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-violet-200/40 dark:shadow-black/40 z-40 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-0 lg:shadow-none flex flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 flex items-center justify-center shadow-glow">
              <Sparkles size={19} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-slate-800 dark:text-white leading-tight">SupportDesk</p>
              {user?.organizationName && <p className="text-[11px] text-violet-500 dark:text-violet-400 font-medium truncate max-w-[140px]">{user.organizationName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200">
            <X size={20} />
          </button>
        </div>
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-violet-200 dark:via-slate-700 to-transparent shrink-0" />
        <nav className="mt-5 px-4 flex flex-col gap-1.5 overflow-y-auto flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-300/50 dark:shadow-violet-900/40" : "text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-slate-800/70 hover:text-violet-700 dark:hover:text-violet-300"}`}>
              <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/60 p-4 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">AI drafted replies are grounded in your knowledge base for accurate, on-brand support.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
