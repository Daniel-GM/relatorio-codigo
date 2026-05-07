import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

export function LineChart({ labels, data, dark, tooltipFormatter }) {
  const teal = dark ? "#4f98a3" : "#01696f";
  const tealFill = dark ? "rgba(79,152,163,0.2)" : "rgba(1,105,111,0.14)";
  const muted = dark ? "#797876" : "#7a7974";
  const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const surfBg = dark ? "#18181b" : "#ffffff";
  const textColor = dark ? "#cdccca" : "#28251d";

  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: teal,
        backgroundColor: tealFill,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: teal,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: surfBg,
        titleColor: textColor,
        bodyColor: muted,
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: tooltipFormatter
            ? (ctx) => tooltipFormatter(ctx.parsed.y)
            : (ctx) => ` ${ctx.parsed.y.toLocaleString("pt-BR")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: muted, font: { size: 11, family: "Inter" } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: muted,
          font: { size: 11, family: "Inter" },
          callback: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
