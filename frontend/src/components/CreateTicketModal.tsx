import { useState, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createTicket } from "../api/tickets";

const CreateTicketModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ subject: string; description: string; customerName: string; customerEmail: string; priority: "low" | "medium" | "high" | "urgent"; category: string }>({ subject: "", description: "", customerName: "", customerEmail: "", priority: "medium", category: "general" });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createTicket(form);
      toast.success("Ticket created");
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 animate-slideup max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Create ticket</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="space-y-3">
          <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <input required type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="Customer email" className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" | "urgent" })} className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <button type="submit" disabled={creating} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 disabled:opacity-60">
            {creating && <Loader2 size={18} className="animate-spin" />}
            Create ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
