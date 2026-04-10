import {
  LayoutDashboard, Users, UserCog, LogOut,
  Moon, Sun, BookOpen, X, Globe,
  ListChecks, ChevronLeft,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef } from "react";

const navItems = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "المجموعات", url: "/groups", icon: Users },
  { title: "الموظفون", url: "/employees", icon: UserCog },
  { title: "محتوى الموقع", url: "/homepage", icon: Globe },
  { title: "ادارة القوائم المنسدلة", url: "/select", icon: ListChecks },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-4 right-4 z-50 w-[300px] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-8 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
            >
              <X size={20} />
            </Button>

            <div className="text-right flex-1">
              <h2 className="font-black text-sm text-slate-800 dark:text-slate-100">إدارة المكتبة</h2>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter">
                Municipality System
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <Separator className="opacity-50 mx-6 w-auto" />

        <div className="px-4 pt-5 flex-1 overflow-y-auto">
          <p className="text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 mr-2">
            القائمة الرئيسية
          </p>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive =
                item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);

              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 h-12 rounded-[1.25rem] transition-all duration-200 justify-end ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {isActive && (
                      <ChevronLeft className="w-4 h-4 opacity-70 animate-in slide-in-from-right-2" />
                    )}
                    <span className="text-sm tracking-tight">{item.title}</span>
                  </div>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : ""}`} />
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="p-4 mt-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full justify-end gap-3 h-11 px-4 text-slate-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-transparent hover:border-slate-100 transition-all"
          >
            <span className="text-xs font-bold">
              {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
            </span>
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-500" />
              : <Moon className="w-4 h-4 text-indigo-500" />}
          </Button>

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-end gap-3 h-11 px-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all font-black text-xs"
          >
            <span>تسجيل الخروج</span>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}