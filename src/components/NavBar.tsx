"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SessionUser {
  id: string;
  name: string;
  role: string;
}

const roleLabels: Record<string, string> = {
  SERVANT: "خادم",
  CLASS_ADMIN: "أمين فصل",
  CLASS_ASSISTANT: "مساعد أمين الفصل",
  MINISTRY_ADMIN: "أمين الخدمة",
};

export default function NavBar({ session }: { session: SessionUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      window.history.replaceState(null, "", pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    setSidebarOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!session) return null;

  const desktopLinks = [
    { href: "/", label: "الرئيسية", show: true },
    { href: "/persons", label: "المخدومين", show: true },
    { href: "/classes", label: "الفصول", show: session.role !== "SERVANT" },
    { href: "/servants", label: "الخدام", show: session.role !== "SERVANT" },
    { href: "/reports", label: "التقارير", show: session.role !== "SERVANT" },
    { href: "/users", label: "المستخدمين", show: session.role === "MINISTRY_ADMIN" },
  ].filter((l) => l.show);

  const sidebarLinks = [
    { href: "/users", label: "إدارة المستخدمين", icon: "👥", show: session.role === "MINISTRY_ADMIN" },
  ].filter((l) => l.show);

  return (
    <>
      <nav
        className="shadow-xl sticky top-0 z-50"
        style={{ background: "linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--gold-light)" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="القائمة"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl" style={{ color: "var(--gold)" }}>☦</span>
            <span className="text-xl font-bold font-amiri" style={{ color: "var(--gold-light)" }}>
              أفا بافلي
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            {desktopLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  color: pathname === l.href ? "var(--gold)" : "var(--cream)",
                  background: pathname === l.href ? "rgba(201, 168, 76, 0.15)" : "transparent",
                  fontWeight: pathname === l.href ? 700 : 400,
                }}
              >
                {l.label}
              </a>
            ))}
            <span className="border-r mx-2 h-5" style={{ borderColor: "var(--gold)", opacity: 0.3 }} />
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}>
              {session.name} • {roleLabels[session.role]}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded text-xs transition-colors mr-1"
              style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}
            >
              خروج
            </button>
          </div>

          {/* Spacer for mobile so logo stays centered */}
          <div className="md:hidden w-10" />
        </div>
      </nav>

      {/* Sidebar overlay — mobile only */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar panel */}
      <div
        className={`md:hidden fixed top-0 right-0 bottom-0 z-[101] w-72 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--navy-dark)" }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 left-4 p-1 rounded-full"
          style={{ color: "var(--gold-light)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* User profile section */}
        <div className="pt-14 px-5 pb-6 text-center" style={{ borderBottom: "1px solid rgba(201, 168, 76, 0.2)" }}>
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
              color: "white",
              border: "3px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            {session.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <h3 className="font-bold text-lg font-amiri" style={{ color: "var(--cream)" }}>
            {session.name}
          </h3>
          <span
            className="inline-block text-xs mt-1 px-3 py-1 rounded-full"
            style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}
          >
            {roleLabels[session.role]}
          </span>
        </div>

        {/* Sidebar links */}
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          {sidebarLinks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold px-3 mb-2" style={{ color: "var(--gold)", opacity: 0.6 }}>
                الإدارة
              </p>
              {sidebarLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
                  style={{
                    color: pathname === l.href ? "var(--gold)" : "var(--cream)",
                    background: pathname === l.href ? "rgba(201, 168, 76, 0.15)" : "transparent",
                  }}
                >
                  <span className="text-lg">{l.icon}</span>
                  <span className="text-sm">{l.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Settings section */}
          <div>
            <p className="text-xs font-bold px-3 mb-2" style={{ color: "var(--gold)", opacity: 0.6 }}>
              الإعدادات
            </p>

            <a
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
              style={{
                color: pathname === "/settings" ? "var(--gold)" : "var(--cream)",
                background: pathname === "/settings" ? "rgba(201, 168, 76, 0.15)" : "transparent",
              }}
            >
              <span className="text-lg">⚙️</span>
              <span className="text-sm">الإعدادات</span>
            </a>
          </div>
        </div>

        {/* Logout button at bottom */}
        <div className="px-4 pb-8" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(122, 45, 60, 0.2)",
              color: "#f0a0a0",
              border: "1px solid rgba(122, 45, 60, 0.3)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            تسجيل خروج
          </button>
        </div>
      </div>
    </>
  );
}
