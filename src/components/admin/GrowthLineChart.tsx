import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const GrowthLineChart = () => {
  const [data, setData] = useState<{ month: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const res = await fetch("/api/Admin/new-members-growth");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching growth:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrowth();
  }, []);

  const createGradient = () => {
    const chart = chartRef.current;
    if (!chart) return "rgba(99,102,241,0.2)";
    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
    return gradient;
  };

  const total = data.reduce((a, b) => a + b.count, 0);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const maxMonth = data.find(d => d.count === maxCount)?.month ?? "";
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: "المشتركين الجدد",
        data: data.map(item => item.count),
        borderColor: "#6366f1",
        backgroundColor: createGradient(),
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        borderWidth: 2.5,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1500, easing: "easeInOutQuart" },
    transitions: { active: { animation: { duration: 300 } } },
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "#312e81",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} مشترك`,
        }
      }
    },
    scales: {
      x: {
        reverse: true,
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          font: { family: "Cairo", size: 11 },
          color: "#888",
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: {
          font: { family: "Cairo", size: 11 },
          color: "#888",
          precision: 0,
        },
        grid: { color: "#f0f0f0" },
        border: { display: false },
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">نمو المشتركين الجدد شهرياً</h3>
        {!loading && total > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {new Date().getFullYear()}
          </span>
        )}
      </div>

      {/* Stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "إجمالي المشتركين", value: total.toLocaleString("ar-EG") },
            { label: "متوسط شهري", value: avg.toLocaleString("ar-EG") },
            { label: "أعلى شهر", value: maxMonth },
          ].map((stat, i) => (
            <div key={i} className="bg-muted/40 border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-[200px]">
        {loading ? (
          <div className="h-full flex items-end gap-1.5 pb-2">
            {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 45, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-muted animate-pulse rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            لا يوجد بيانات
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>

    </Card>
  );
};

export default GrowthLineChart;