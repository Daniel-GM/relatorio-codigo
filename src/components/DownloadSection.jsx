import { Button } from "./Button";
import { SectionTitle } from "./SectionTitle";

const STEPS = [
  {
    step: "1",
    title: "Instale o Python",
    description: "Certifique-se de ter Python 3.8+ instalado. Verifique com:",
    code: "python --version",
  },
  {
    step: "2",
    title: "Vá até o repositório git",
    description:
      "Navegue pelo terminal até a pasta raiz do seu repositório git:",
    code: "cd /caminho/do/seu/projeto",
  },
  {
    step: "3",
    title: "Execute o script",
    description: "Rode o script Python diretamente na pasta do repositório:",
    code: "python relatorio_codigo.py",
  },
  {
    step: "4",
    title: "Carregue o JSON gerado",
    description:
      "O script vai gerar o arquivo relatorio_mensal.json na mesma pasta. Arraste-o para a área acima.",
    code: null,
  },
];

function CodeBlock({ code }) {
  const copy = () => navigator.clipboard.writeText(code);
  return (
    <div className="relative group mt-1.5 bg-zinc-900 dark:bg-zinc-950 rounded-lg overflow-hidden">
      <pre className="px-4 py-2.5 text-sm font-mono text-teal-300 overflow-x-auto">
        {code}
      </pre>
      <button
        onClick={copy}
        title="Copiar"
        className="absolute top-1.5 right-2 text-[0.65rem] text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        copiar
      </button>
    </div>
  );
}

function StepCard({ step, title, description, code }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-sm font-bold flex items-center justify-center">
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {description}
        </p>
        {code && <CodeBlock code={code} />}
      </div>
    </div>
  );
}

export function DownloadSection() {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm p-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <SectionTitle
          title="Script de Geração"
          description="Baixe o script Python e execute-o no seu repositório git para gerar o JSON de dados."
        />
        <a href="/relatorio_codigo.py" download="relatorio_codigo.py">
          <Button variant="primary">Baixar relatorio_codigo.py</Button>
        </a>
      </div>

      <div className="space-y-5">
        {STEPS.map((s) => (
          <StepCard key={s.step} {...s} />
        ))}
      </div>

      <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-xs text-amber-700 dark:text-amber-300">
        O script deve ser executado dentro de um repositório git válido. Ele lê
        o histórico de commits via <code className="font-mono">git log</code> e
        conta as linhas por extensão.
      </div>
    </div>
  );
}
