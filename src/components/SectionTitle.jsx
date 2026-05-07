export function SectionTitle({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}
