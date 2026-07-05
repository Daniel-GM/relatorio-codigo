import { useState, useMemo } from "react";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { StatCard } from "./components/StatCard";
import { ChartCard } from "./components/ChartCard";
import { LineChart } from "./components/LineChart";
import { BarChart } from "./components/BarChart";
import { DoughnutChart } from "./components/DoughnutChart";
import { DropZone } from "./components/DropZone";
import { DownloadSection } from "./components/DownloadSection";
import { ExportButton } from "./components/ExportButton";

// # helpers

function fmtK(n) {
  if (n == null) return "–";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function fmtMonth(iso) {
  const [y, m] = iso.split("-");
  const names = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${names[parseInt(m, 10) - 1]}/${y.slice(2)}`;
}

function fmtDurationParts(days) {
  if (days == null) return null;

  const years = Math.floor(days / 365);
  const daysAfterYears = days % 365;
  const months = Math.floor(daysAfterYears / 30);
  const weeks = Math.floor((daysAfterYears % 30) / 7);

  const parts = [];
  if (years > 0) parts.push(`${years} anos`);
  if (months > 0) parts.push(`${months} meses`);
  if (weeks > 0) parts.push(`${weeks} sem.`);

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
}

// # App

export default function App() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  const [reportData, setReportData] = useState(null);

  const derived = useMemo(() => {
    if (!reportData) return null;
    const { relatorio, estatisticas } = reportData;

    const labels = relatorio.map((r) => fmtMonth(r.mes));
    const totais = relatorio.map((r) => r.total_linhas);
    const deltas = relatorio.map((r) => r.delta_linhas);
    const medias = relatorio.map((r) => r.media_linhas_por_dia);

    const lastMonth = relatorio[relatorio.length - 1];
    const extEntries = Object.entries(lastMonth.por_extensao ?? {}).sort(
      (a, b) => b[1] - a[1],
    );
    const extLabels = extEntries.map(([k]) => k);
    const extValues = extEntries.map(([, v]) => v);

    const first = fmtMonth(relatorio[0].mes);
    const last = fmtMonth(lastMonth.mes);
    const subtitle = `${first} → ${last}`;

    return {
      labels,
      totais,
      deltas,
      medias,
      extLabels,
      extValues,
      subtitle,
      estatisticas,
    };
  }, [reportData]);

  const exportName = `relatorio-${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 transition-colors font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10 pb-16 space-y-8">
        {/* Capturable dashboard area */}
        <div
          id="dashboard-capture"
          className="space-y-8 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl"
        >
          {/* Header */}
          <Header
            subtitle={derived?.subtitle}
            badgeText={
              derived
                ? `${fmtK(derived.estatisticas.total_atual)} linhas acumuladas`
                : null
            }
            theme={theme}
            onToggleTheme={toggle}
          />

          {/* Stats grid */}
          {derived && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Total Atual"
                value={fmtK(derived.estatisticas.total_atual)}
                sub="linhas no repositório"
                accent
              />
              <StatCard
                label="Dias desde início"
                value={derived.estatisticas.dias_desde_inicio ?? "–"}
                sub="desde o 1º commit"
                detail={fmtDurationParts(derived.estatisticas.dias_desde_inicio)}
              />
              <StatCard
                label="Média histórica"
                value={`${derived.estatisticas.media_historica_linhas_por_dia ?? "–"}`}
                sub="linhas/dia histórico"
              />
              <StatCard
                label="Previsão 12 meses"
                value={fmtK(derived.estatisticas.previsao_12_meses)}
                sub="linhas estimadas"
                accent
              />
            </div>
          )}

          {/* Charts grid */}
          {derived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ChartCard title="Total de Linhas Acumuladas">
                <LineChart
                  labels={derived.labels}
                  data={derived.totais}
                  dark={dark}
                  tooltipFormatter={(v) =>
                    ` ${v.toLocaleString("pt-BR")} linhas acumuladas`
                  }
                />
              </ChartCard>

              <ChartCard title="Variação Mensal (Delta)">
                <BarChart
                  labels={derived.labels}
                  data={derived.deltas}
                  dark={dark}
                  color="red"
                  tooltipFormatter={(v) =>
                    ` +${v.toLocaleString("pt-BR")} linhas`
                  }
                />
              </ChartCard>

              <ChartCard title="Média de Linhas/Dia">
                <BarChart
                  labels={derived.labels}
                  data={derived.medias}
                  dark={dark}
                  color="green"
                  tooltipFormatter={(v) => ` ${v.toFixed(1)} linhas/dia`}
                />
              </ChartCard>

              <ChartCard
                title={`Linhas por Extensão (${derived.labels[derived.labels.length - 1]})`}
              >
                <DoughnutChart
                  labels={derived.extLabels}
                  data={derived.extValues}
                  dark={dark}
                />
              </ChartCard>
            </div>
          )}

          {/* Creation date footer (visible in export) */}
          {derived && (
            <p className="text-center text-[0.68rem] text-zinc-400 dark:text-zinc-600 pt-2">
              Relatório gerado em{" "}
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Export button – only shown when data is loaded */}
        {derived && (
          <div className="flex justify-end">
            <ExportButton targetId="dashboard-capture" baseName={exportName} />
          </div>
        )}

        {/* Drop zone */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {derived ? "Trocar dados" : "Carregar dados"}
          </p>
          <DropZone onData={setReportData} />
        </div>

        {/* Download + instructions */}
        <DownloadSection />
      </div>
    </div>
  );
}
