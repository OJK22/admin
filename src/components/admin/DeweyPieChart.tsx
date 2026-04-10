import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#0ea5e9", "#a855f7", "#14b8a6", "#f43f5e",
  "#fb923c", "#84cc16",
];

const DeweyPieChart = () => {
  const [data, setData] = useState<{ classification: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch("/api/Admin/books-by-class");
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching chart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const total = data.reduce((a, b) => a + b.count, 0);

  const chartData = {
    labels: data.map(item => item.classification),
    datasets: [
      {
        label: "عدد الكتب",
        data: data.map(item => item.count),
        backgroundColor: COLORS.slice(0, data.length),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 6,
      }
    ]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: "Cairo", size: 13 },
        titleFont: { family: "Cairo", size: 13 },
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return ` ${ctx.parsed} كتاب (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <Card className="p-5 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">توزيع الكتب حسب تصنيف ديوي</h3>
        {!loading && total > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {total.toLocaleString("ar-EG")} كتاب
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex gap-4">
          {/* skeleton دائرة */}
          <div className="w-[180px] h-[180px] rounded-full bg-muted animate-pulse shrink-0 mx-auto" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-muted-foreground text-center py-10">لا يوجد بيانات</div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* Doughnut */}
          <div className="relative shrink-0" style={{ width: 180, height: 300 }}>
            <Doughnut data={chartData} options={options} />
            {/* نص في المنتصف */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-foreground">{total.toLocaleString("ar-EG")}</span>
              <span className="text-[10px] text-muted-foreground">كتاب</span>
            </div>
          </div>

          {/* Legend مخصص */}
          <div className="flex-1 w-full space-y-2">
            {data.map((item, i) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
              return (
                <div key={i} className="flex items-center gap-2">
                  {/* لون */}
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {/* اسم التصنيف */}
                  <span className="text-xs text-foreground flex-1 truncate">{item.classification}</span>
                  {/* شريط */}
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  {/* نسبة */}
                  <span className="text-xs text-muted-foreground w-10 text-left shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </Card>
  );
};

export default DeweyPieChart;