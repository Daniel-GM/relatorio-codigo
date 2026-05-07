import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ labels, data, dark }) {
  const muted = dark ? "#797876" : "#7a7974";
  const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const surfBg = dark ? "#18181b" : "#ffffff";
  const textColor = dark ? "#cdccca" : "#28251d";

  const palette = dark
    ? ["#4f98a3", "#dd6974", "#6daa45", "#e8af34", "#a86fdf"]
    : ["#01696f", "#e05252", "#3d8c4f", "#d4960c", "#7c3aed"];

  const total = data.reduce((a, b) => a + b, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: palette,
        borderWidth: 2,
        borderColor: surfBg,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "52%",
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: muted,
          font: { size: 11, family: "Inter" },
          padding: 10,
          boxWidth: 12,
          boxHeight: 12,
          generateLabels: (chart) =>
            chart.data.labels.map((lbl, i) => {
              const pct = ((data[i] / total) * 100).toFixed(1);
              return {
                text: `${lbl}  ${pct}%`,
                fillStyle: palette[i],
                fontColor: muted,
                strokeStyle: "transparent",
                hidden: false,
                index: i,
              };
            }),
        },
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
          label: (ctx) => {
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return ` ${ctx.raw.toLocaleString("pt-BR")} linhas (${pct}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
