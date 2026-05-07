import { useState, useCallback } from "react";

export function DropZone({ onData, onError }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const processFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.endsWith(".json")) {
        const msg = "Apenas arquivos .json são aceitos.";
        setError(msg);
        onError?.(msg);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.relatorio || !parsed.estatisticas) {
            throw new Error(
              'Estrutura inválida: campos "relatorio" e "estatisticas" ausentes.',
            );
          }
          setFileName(file.name);
          setError(null);
          onData(parsed);
        } catch (err) {
          const msg = `JSON inválido: ${err.message}`;
          setError(msg);
          onError?.(msg);
        }
      };
      reader.readAsText(file);
    },
    [onData, onError],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile],
  );

  const handleChange = (e) => processFile(e.target.files[0]);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer select-none
        ${
          dragging
            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:border-teal-400 dark:hover:border-teal-500"
        }`}
      onClick={() => document.getElementById("json-upload-input").click()}
    >
      <input
        id="json-upload-input"
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleChange}
      />

      {fileName ? (
        <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
          {fileName} carregado
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Solte o arquivo{" "}
            <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              relatorio_mensal.json
            </code>{" "}
            aqui
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            ou clique para selecionar o arquivo
          </p>
        </>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
