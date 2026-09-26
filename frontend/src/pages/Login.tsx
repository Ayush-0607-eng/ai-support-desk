import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-glow shadow-xl shadow-violet-200/40 dark:shadow-black/30 p-8 animate-slideup">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-slate-800 dark:text-white">SupportDesk</span>
        </div>
        <h1 className="text-center text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">Welcome back</h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to manage your support tickets</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-4 py-3 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow duration-200" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 disabled:opacity-60">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Sign in
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account? <Link to="/register" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
