export function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm p-5 transition-colors">
      <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
        {title}
      </p>
      <div className="relative h-[220px]">{children}</div>
    </div>
  );
}
