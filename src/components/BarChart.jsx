import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const valueLabelsPlugin = {
  id: "barValueLabels",
  afterDatasetsDraw(chart, _args, options) {
    if (!options?.display) return;

    const { ctx, chartArea } = chart;
    const dataset = chart.data.datasets[0];
    const bars = chart.getDatasetMeta(0).data;

    ctx.save();
    ctx.fillStyle = options.color;
    ctx.font = `600 ${options.fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    bars.forEach((bar, index) => {
      const value = Number(dataset.data[index]);
      if (!Number.isFinite(value)) return;

      const { x, y } = bar.getProps(["x", "y"], true);
      const label = `${value > 0 ? "+" : ""}${value.toLocaleString("pt-BR")}`;
      const halfLabelWidth = ctx.measureText(label).width / 2;
      const labelX = Math.min(
        chartArea.right - halfLabelWidth,
        Math.max(chartArea.left + halfLabelWidth, x),
      );
      const labelY = value < 0
        ? Math.min(y + options.offset, chartArea.bottom - options.offset)
        : Math.max(y - options.offset, chartArea.top + options.offset);

      ctx.fillText(label, labelX, labelY);
    });

    ctx.restore();
  },
};

export function BarChart({
  labels,
  data,
  dark,
  color = "red",
  tooltipFormatter,
  showValues = false,
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
      barValueLabels: {
        display: showValues,
        color: textColor,
        fontSize: 11,
        offset: 8,
      },
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

  return <Bar data={chartData} options={options} plugins={[valueLabelsPlugin]} />;
}
