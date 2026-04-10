import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setToken, clearToken, getToken } from "@/lib/api";

// تعريف واجهة بيانات المستخدم
interface AuthUser {
  token: string;
  userName?: string;
  permissions?: string[]; // مصفوفة الصلاحيات (مثل: "Employee", "Book", "Group")
  [key: string]: any;
}

// تعريف واجهة السياق (Context)
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // عند تشغيل التطبيق: استعادة الجلسة من LocalStorage
  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem("auth_user");
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        clearToken();
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  // دالة تسجيل الدخول
  const login = async (userName: string, password: string) => {
    try {
      // إرسال طلب الدخول للباك-إند
      const res = await authApi.login({ userName, password });

      // استخراج التوكن بناءً على التنسيق المتوقع من السيرفر
      const token = res.token || res.accessToken || (typeof res === 'string' ? res : null);

      if (token) {
        // 1. حفظ التوكن في الـ Headers للطلبات القادمة
        setToken(token);

        // 2. تجهيز بيانات المستخدم مع الصلاحيات والتوكن
        // ملاحظة: تأكد أن الباك-إند يرسل حقل permissions كمصفوفة نصوص
        const userData: AuthUser = { 
          ...res, 
          token,
          // ضمان وجود مصفوفة حتى لو لم يرجعها السيرفر
          permissions: res.permissions || [] 
        };

        // 3. التخزين في LocalStorage لدوام الجلسة
        localStorage.setItem("auth_user", JSON.stringify(userData));
        
        // 4. تحديث حالة الـ State
        setUser(userData);
      } else {
        throw new Error("Invalid response from server: No token found");
      }
    } catch (error: any) {
      // مسح أي بيانات قديمة في حال فشل الدخول
      logout();
      // إعادة رمي الخطأ لتلتقطه صفحة Login وتظهر الـ Toast المناسب
      throw error; 
    }
  };

  // دالة تسجيل الخروج
  const logout = () => {
    clearToken();
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  // دالة فحص الصلاحية (تستخدم لحماية العناصر والروابط)
  const hasPermission = (permName: string) => {
    if (!user || !user.permissions) return false;
    
    // إذا كان المستخدم Admin (اختياري: إذا أردت إعطاء الأدمن كل الصلاحيات تلقائياً)
    if (user.userName === "admin") return true;

    return user.permissions.includes(permName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}