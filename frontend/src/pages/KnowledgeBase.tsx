import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, FileText, Loader2, X, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { getKnowledgeDocs, createKnowledgeDoc, deleteKnowledgeDoc, uploadKnowledgeDoc } from "../api/knowledge";
import { KnowledgeDoc } from "../types";
import Loader from "../components/Loader";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  indexed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
};

const KnowledgeBase = () => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const load = async () => {
    setLoading(true);
    const data = await getKnowledgeDocs();
    setDocs(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createKnowledgeDoc(form.title, form.content);
      toast.success("Document added and indexed");
      setModalOpen(false);
      setForm({ title: "", content: "" });
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add document");
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setUploading(true);
    try {
      await uploadKnowledgeDoc(file, file.name.replace(".pdf", ""));
      toast.success("PDF uploaded and indexed");
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload PDF");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteKnowledgeDoc(docId);
      setDocs((prev) => prev.filter((d) => d._id !== docId));
      toast.success("Document removed");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Knowledge base</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Documents used to ground AI drafted replies</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center justify-center gap-2 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-medium px-4 py-2.5 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors duration-200 cursor-pointer">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
            Upload PDF
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors duration-200">
            <Plus size={18} /> Add document
          </button>
        </div>
      </div>

      {loading ? <Loader /> : docs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 dark:text-slate-500">No documents yet. Add your first article to power AI replies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div key={doc._id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xl shadow-violet-200/40 dark:shadow-black/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={16} className="text-violet-500 shrink-0" />
                  <h3 className="font-medium text-slate-800 dark:text-white truncate">{doc.title}</h3>
                </div>
                <button onClick={() => handleDelete(doc._id)} className="text-slate-400 hover:text-rose-500 shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{doc.content}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[doc.status]}`}>{doc.status}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{doc.chunkCount} chunks</span>
              </div>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{format(new Date(doc.createdAt), "MMM d, yyyy")}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 animate-slideup max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Add knowledge document</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Document title" className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Paste article or documentation content" rows={8} className="w-full px-4 py-2.5 rounded-xl border border-violet-200 dark:border-slate-700 bg-violet-50/50 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              <button type="submit" disabled={creating} className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-xl transition-colors duration-200 disabled:opacity-60">
                {creating && <Loader2 size={18} className="animate-spin" />}
                Add and index document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
