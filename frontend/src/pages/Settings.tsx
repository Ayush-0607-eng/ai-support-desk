import { useState } from "react";
import { Moon, Sun, Monitor, Building2, Copy, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!user?.inviteCode) return;
    navigator.clipboard.writeText(user.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your workspace preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div style={{ backgroundColor: user?.avatarColor }} className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="text-xs text-violet-600 dark:text-violet-400 capitalize font-medium mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
        <div className="flex items-center gap-3 mb-3">
          <Building2 size={20} className="text-violet-500" />
          <h2 className="font-semibold text-slate-800 dark:text-white">Workspace</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{user?.organizationName}</p>
        {user?.role === "admin" && user?.inviteCode && (
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Team invite code</label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex-1 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-slate-800 border border-violet-200 dark:border-slate-700 font-mono tracking-widest text-violet-700 dark:text-violet-300 text-sm">{user.inviteCode}</span>
              <button onClick={handleCopy} className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors duration-200">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Share this code with teammates so they can join your workspace as agents</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-violet-600" />}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark mode</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Switch between light and dark themes</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="px-4 py-2 rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors duration-200">
            {theme === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
        <div className="flex items-center gap-3 mb-2">
          <Monitor size={20} className="text-violet-500" />
          <h2 className="font-semibold text-slate-800 dark:text-white">About</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">AI SupportDesk uses retrieval-augmented generation to draft grounded responses from your knowledge base, helping agents resolve tickets faster.</p>
      </div>
    </div>
  );
};

export default Settings;
