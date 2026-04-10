import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title, Tooltip,Legend,} from "chart.js";
import { Card } from "@/components/ui/card";
import type { Animations, InteractionModeMap } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BooksLineChart = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  const chartRef = useRef(null);

  useEffect(() => {
    fetch("/api/Admin/new-vs-removed")
      .then((res) => res.json())
      .then((apiData) => {
        const months = [
          "يناير","فبراير","مارس","أبريل","مايو","يونيو",
          "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
        ];

        const labels = months;
        const addedData = months.map((_, index) => {
          const monthData = apiData.find(item => item.monthNumber === index + 1);
          return monthData ? monthData.newCount : 0;
        });
        const removedData = months.map((_, index) => {
          const monthData = apiData.find(item => item.monthNumber === index + 1);
          return monthData ? monthData.removedCount : 0;
        });

        const chart = chartRef.current;
        const ctx = chart?.ctx;

        const gradientAdded = ctx?.createLinearGradient(0, 0, 0, 300);
        gradientAdded?.addColorStop(0, "rgba(59, 130, 246, 0.3)");
        gradientAdded?.addColorStop(1, "rgba(59, 130, 246, 0)");

        const gradientRemoved = ctx?.createLinearGradient(0, 0, 0, 300);
        gradientRemoved?.addColorStop(0, "rgba(239, 68, 68, 0.3)");
        gradientRemoved?.addColorStop(1, "rgba(239, 68, 68, 0)");

        setData({
          labels,
          datasets: [
            {
              label: "كتب مضافة",
              data: addedData,
              borderColor: "#3b82f6",
              backgroundColor: gradientAdded,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "#3b82f6",
            },
            {
              label: "كتب مُخرجة",
              data: removedData,
              borderColor: "#ef4444",
              backgroundColor: gradientRemoved,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "#ef4444",
            },
          ],
        });
      })
      .catch((err) => console.error("Failed to fetch chart data:", err));
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          font: { family: "Cairo", size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
        bodyFont: { family: "Cairo" },
        titleFont: { family: "Cairo" },
      },
    },
 interaction: {
  mode: 'nearest' as keyof InteractionModeMap,
  intersect: false,
},
    scales: {
      x: {
        ticks: { font: { family: "Cairo", size: 10 } },
      },
      y: {
        ticks: { font: { family: "Cairo", size: 11 }, padding: 10 },
        beginAtZero: true,
      },
    },
    Animations: {
      x: { duration: 1500, easing: 'easeOutQuart' },
      y: { duration: 1500, easing: 'easeOutQuart' },
      tension: { duration: 1200, easing: 'easeInOutCubic', from: 0.3, to: 0.4 }
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-base font-bold text-card-foreground text-right mb-4">
        الكتب المضافة vs المُخرجة (12 شهر)
      </h3>
      <div className="h-[300px]">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </Card>
  );
};

export default BooksLineChart;