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
    <nav className="bg-navy text-white shadow-xl" style={{ background: "linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-2xl" style={{ color: "var(--gold)" }}>☦</span>
          <span className="text-xl font-bold font-amiri" style={{ color: "var(--gold-light)" }}>
            أفا بافلي
          </span>
        </a>
        <div className="flex items-center gap-1 text-sm">
          <NavLink href="/">الرئيسية</NavLink>
          <NavLink href="/persons">المخدومين</NavLink>

          {session.role !== "SERVANT" && (
            <>
              <NavLink href="/classes">الفصول</NavLink>
              <NavLink href="/servants">الخدام</NavLink>
              <NavLink href="/reports">التقارير</NavLink>
            </>
          )}

          {session.role === "MINISTRY_ADMIN" && (
            <NavLink href="/users">المستخدمين</NavLink>
          )}

          <span className="border-r mx-2 h-5" style={{ borderColor: "var(--gold)", opacity: 0.3 }} />

          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}>
            {session.name} • {roleLabels[session.role]}
          </span>

          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded text-xs transition-colors mr-1"
            style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201, 168, 76, 0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201, 168, 76, 0.15)")}
          >
            خروج
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm transition-all"
      style={{ color: "var(--cream)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(201, 168, 76, 0.15)";
        e.currentTarget.style.color = "var(--gold-light)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--cream)";
      }}
    >
      {children}
    </a>
  );
}
