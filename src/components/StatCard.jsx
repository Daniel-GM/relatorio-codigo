export function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm p-4 transition-colors">
      <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
        {label}
      </p>
      <p
        className={`text-3xl font-bold tabular-nums tracking-tight ${
          accent
            ? "text-teal-600 dark:text-teal-400"
            : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[0.68rem] text-zinc-400 dark:text-zinc-500 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}
