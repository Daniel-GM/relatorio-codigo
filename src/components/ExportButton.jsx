import { useState } from "react";
import { exportReport } from "../utils/exportReport";
import { Button } from "./Button";

export function ExportButton({ targetId, baseName }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async (format) => {
    setOpen(false);
    setLoading(true);
    try {
      await exportReport(targetId, format, baseName);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        {loading ? "Exportando…" : "Exportar relatório"}
        <span className="text-xs opacity-60">▾</span>
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-20 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
            <button
              onClick={() => handleExport("pdf")}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Baixar como PDF
            </button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-700" />
            <button
              onClick={() => handleExport("png")}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Baixar como Imagem
            </button>
          </div>
        </>
      )}
    </div>
  );
}
