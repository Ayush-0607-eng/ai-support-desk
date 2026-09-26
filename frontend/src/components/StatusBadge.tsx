const statusStyles: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  resolved: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  closed: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
};

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status] || statusStyles.open}`}>{status}</span>
);

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${priorityStyles[priority] || priorityStyles.medium}`}>{priority}</span>
);
