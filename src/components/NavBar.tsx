"use client";

import { useRouter } from "next/navigation";

interface SessionUser {
  id: string;
  name: string;
  role: string;
}

const roleLabels: Record<string, string> = {
  SERVANT: "خادم",
  CLASS_ADMIN: "أمين فصل",
  MINISTRY_ADMIN: "أمين الخدمة",
};

export default function NavBar({ session }: { session: SessionUser | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!session) return null;

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          ✝ أفا بافلي
        </a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/" className="hover:text-blue-200">الرئيسية</a>
          <a href="/persons" className="hover:text-blue-200">الحالات</a>

          {session.role !== "SERVANT" && (
            <>
              <a href="/classes" className="hover:text-blue-200">الفصول</a>
              <a href="/servants" className="hover:text-blue-200">الخدام</a>
              <a href="/reports" className="hover:text-blue-200">التقارير</a>
            </>
          )}

          {session.role === "MINISTRY_ADMIN" && (
            <a href="/users" className="hover:text-blue-200">المستخدمين</a>
          )}

          <span className="border-r border-blue-500 h-4" />

          <span className="text-blue-200 text-xs">
            {session.name} ({roleLabels[session.role]})
          </span>

          <button
            onClick={handleLogout}
            className="bg-blue-800 px-3 py-1 rounded text-xs hover:bg-blue-900"
          >
            خروج
          </button>
        </div>
      </div>
    </nav>
  );
}
