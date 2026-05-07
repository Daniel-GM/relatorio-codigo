export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
  const variants = {
    primary:
      "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400",
    secondary:
      "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
    ghost:
      "bg-transparent text-zinc-500 hover:text-teal-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-teal-400 focus:ring-zinc-300",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
