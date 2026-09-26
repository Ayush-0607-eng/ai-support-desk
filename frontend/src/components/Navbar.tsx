import { Menu, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 pt-4">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-violet-200/30 dark:shadow-black/30">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200">
          <Menu size={22} />
        </button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: user?.avatarColor }} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize leading-tight">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} aria-label="Logout" className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
