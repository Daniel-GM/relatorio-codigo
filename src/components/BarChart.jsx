import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function BarChart({
  labels,
  data,
  dark,
  color = "red",
  tooltipFormatter,
}) {
  const palette = {
    red: dark ? "#dd6974" : "#e05252",
    green: dark ? "#6daa45" : "#3d8c4f",
    teal: dark ? "#4f98a3" : "#01696f",
  };

  const muted = dark ? "#797876" : "#7a7974";
  const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const surfBg = dark ? "#18181b" : "#ffffff";
  const textColor = dark ? "#cdccca" : "#28251d";

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: palette[color] || palette.red,
        borderRadius: 6,
        borderSkipped: false,
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
        ticks: { color: muted, font: { size: 11, family: "Inter" } },
        grid: { color: gridColor },
        border: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
