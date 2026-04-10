import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { useTheme } from "@/contexts/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme, toggleTheme } = useTheme();
 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950">

      <header className="h-28 sticky top-0 z-30 flex items-center justify-between px-8
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
        border-b border-slate-200/70 dark:border-slate-800/70
        shadow-sm">

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="w-11 h-11 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <div className="relative">
            <img
              src="slogan.png"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-100 dark:ring-indigo-900"
            />
          </div>

          <p className="text-base font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
           مدير النظام</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
            </svg>
          </div>

          <span className="text-base font-black text-slate-700 dark:text-slate-200 tracking-tight hidden md:block">
            نظام إدارة المكتبة
          </span>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-11 h-11 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl"
          >
            {theme === "dark"
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5" />}
          </Button>
        </div>

      </header>

     <div className="flex flex-1 relative">
  <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  
  <div className="flex flex-1 flex-col">
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      {children}
    </main>
    <Footer />
  </div>
</div>
</div>
    
  );
}