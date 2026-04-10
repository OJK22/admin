import { useEffect, useState } from "react";
import { BookOpen, Users, BookMarked, AlertTriangle, DollarSign } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import RevenueCard from "@/components/admin/RevenueCard";
import DeweyPieChart from "@/components/admin/DeweyPieChart";
import TopSuppliers from "@/components/admin/TopSuppliers";
import BooksLineChart from "@/components/admin/BooksLineChart";
import SubscribersCategoryChart from "@/components/admin/SubscribersCategoryChart";
import SubscribersRegionChart from "@/components/admin/SubscribersRegionChart";
import GrowthLineChart from "@/components/admin/GrowthLineChart";
import LateBorrowsChart from "@/components/admin/LateBorrowChart";
import TopBorrowersChart from "@/components/admin/TopBorrowChart";
import BorrowsActivityChart from "@/components/admin/BorrowsActivityChart";

const Index = () => {
  const [stats, setStats] = useState({
    totalbooks: 0,
    activeMembers: 0,
    activeBorrows: 0,
    lateBorrows: 0
  });

  const [income, setIncome] = useState({
    subscriptionIncome: 0,
    fineIncome: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let isMounted = true;

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const fetchWithRetry = async (url: string, retries = 2) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);

        if (res.status === 429) {
          console.warn(`429 on ${url}... retrying`);
          await delay(2000); // نهدأ شوي قبل إعادة المحاولة
          continue;
        }

        if (!res.ok) throw new Error("Request failed");

        return await res.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await delay(1500);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const statsData = await fetchWithRetry("/api/Admin/cards", 2);
      await delay(1000); 
      const incomeData = await fetchWithRetry("/api/Admin/income-cards", 2);

      if (isMounted) {
        setStats(statsData ?? {
          totalbooks: 0,
          activeMembers: 0,
          activeBorrows: 0,
          lateBorrows: 0
        });

        setIncome(incomeData ?? {
          subscriptionIncome: 0,
          fineIncome: 0
        });
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      if (isMounted) {
        setStats({
          totalbooks: 0,
          activeMembers: 0,
          activeBorrows: 0,
          lateBorrows: 0
        });

        setIncome({
          subscriptionIncome: 0,
          fineIncome: 0
        });
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 md:px-8 py-6 space-y-10" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center shadow-inner">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                لوحة تحكم المكتبة 📚
              </h1>
              <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Municipality Library Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الكتب"
            value={loading ? "..." : `${stats.totalbooks}`}
            change="—"
            changeType="positive"
            icon={BookOpen}
            iconBg="bg-primary/10 text-primary"
          />
          <StatCard
            title="المشتركون النشطون"
            value={loading ? "..." : `${stats.activeMembers}`}
            change="—"
            changeType="positive"
            icon={Users}
            iconBg="bg-green-500/10 text-green-500"
          />
          <StatCard
            title="الإعارات الحالية"
            value={loading ? "..." : `${stats.activeBorrows}`}
            change="—"
            changeType="positive"
            icon={BookMarked}
            iconBg="bg-yellow-500/10 text-yellow-500"
          />
          <StatCard
            title="كتب متأخرة الإرجاع"
            value={loading ? "..." : `${stats.lateBorrows}`}
            change="—"
            changeType="negative"
            icon={AlertTriangle}
            iconBg="bg-red-500/10 text-red-500"
          />
        </div>

        {/* Revenue Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <h2 className="text-lg font-bold text-foreground">الإيرادات والمخالفات</h2>
            <div className="w-1 h-6 bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RevenueCard 
              title="إيرادات الاشتراكات" 
              subtitle="إجمالي إيرادات هذا الشهر" 
              value={loading ? "..." : `₪ ${income.subscriptionIncome}`} 
              change="—" 
              icon={DollarSign} 
              iconBg="bg-green-500/10 text-green-500" 
            />
            <RevenueCard 
              title="إيرادات المخالفات" 
              subtitle="غرامات التأخير" 
              value={loading ? "..." : `₪ ${income.fineIncome}`} 
              change="—" 
              icon={AlertTriangle} 
              iconBg="bg-yellow-500/10 text-yellow-500" 
            />
          </div>
        </section>

        {/* Books Analysis */}
        <section className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <h2 className="text-lg font-bold text-foreground">تحليل الكتب</h2>
            <div className="w-1 h-6 bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <DeweyPieChart />
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <BooksLineChart />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
            <TopSuppliers />
          </div>
        </section>

        {/* Subscribers Analysis */}
        <section className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <h2 className="text-lg font-bold text-foreground">تحليل المشتركين والنمو</h2>
            <div className="w-1 h-6 bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <SubscribersRegionChart />
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <SubscribersCategoryChart />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
            <GrowthLineChart />
          </div>
        </section>

        {/* Borrows Analysis */}
        <section className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <h2 className="text-lg font-bold text-foreground">تحليل الإعارات</h2>
            <div className="w-1 h-6 bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <LateBorrowsChart />
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
              <TopBorrowersChart />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition">
            <BorrowsActivityChart />
          </div>
        </section>

      </div>
    </div>
  );
};

export default Index;