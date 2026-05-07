import { Badge } from "./Badge";
import { Button } from "./Button";

export function Header({ subtitle, badgeText, theme, onToggleTheme }) {
  return (
    <header className="text-center relative mb-8">
      <div className="absolute top-0 right-0">
        <Button variant="ghost" onClick={onToggleTheme} title="Alternar tema">
          {theme === "dark" ? "☀️" : "🌙"}
        </Button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        Relatório Mensal de Código
      </h1>

      {subtitle && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
          Git · {subtitle}
        </p>
      )}

      {badgeText && (
        <div className="mt-2">
          <Badge variant="teal">{badgeText}</Badge>
        </div>
      )}
    </header>
  );
}
