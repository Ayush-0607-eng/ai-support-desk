import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, Building2, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { registerOrganization, registerAgent } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await registerOrganization(name, email, password, organizationName);
      } else {
        await registerAgent(name, email, password, inviteCode);
      }
      toast.success("Account created");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glow shadow-xl shadow-violet-200/40 dark:shadow-black/30 p-8 animate-slideup">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-800 dark:text-white">SupportDesk</span>
        </div>
        <div className="flex bg-violet-50 dark:bg-slate-800 rounded-xl p-1 mb-6">
          <button type="button" onClick={() => setMode("create")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === "create" ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>New workspace</button>
          <button type="button" onClick={() => setMode("join")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${mode === "join" ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>Join with invite</button>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
          {mode === "create" ? "Create your own workspace and become its admin" : "Join an existing team using their invite code"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
          </div>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
          </div>
          {mode === "create" ? (
            <div className="relative">
              <Building2 size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input required value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Workspace name (e.g. Acme Support)" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
            </div>
          ) : (
            <div className="relative">
              <KeyRound size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input required value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="Invite code" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200 tracking-widest" />
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 disabled:opacity-60">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === "create" ? "Create workspace" : "Join workspace"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
