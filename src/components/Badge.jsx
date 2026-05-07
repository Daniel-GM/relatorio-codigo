export function Badge({ children, variant = "teal" }) {
  const variants = {
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    gray: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <span
      className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
