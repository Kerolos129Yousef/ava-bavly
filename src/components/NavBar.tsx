"use client";

import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!session) return null;

  const links = [
    { href: "/", label: "الرئيسية", show: true },
    { href: "/persons", label: "المخدومين", show: true },
    { href: "/classes", label: "الفصول", show: session.role !== "SERVANT" },
    { href: "/servants", label: "الخدام", show: session.role !== "SERVANT" },
    { href: "/reports", label: "التقارير", show: session.role !== "SERVANT" },
    { href: "/users", label: "المستخدمين", show: session.role === "MINISTRY_ADMIN" },
  ].filter((l) => l.show);

  return (
    <nav
      className="shadow-xl sticky top-0 z-50 relative"
      style={{ background: "linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl" style={{ color: "var(--gold)" }}>☦</span>
          <span className="text-xl font-bold font-amiri" style={{ color: "var(--gold-light)" }}>
            أفا بافلي
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={pathname === l.href}>
              {l.label}
            </NavLink>
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "var(--gold-light)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          {/* Backdrop — closes menu on tap */}
          <div
            className="md:hidden fixed inset-0"
            style={{ background: "rgba(0,0,0,0.4)", top: 0, zIndex: -1 }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="md:hidden border-t px-4 pb-4 pt-2 absolute left-0 right-0 shadow-2xl"
            style={{ borderColor: "rgba(201, 168, 76, 0.2)", background: "var(--navy-dark)", top: "100%" }}
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    color: pathname === l.href ? "var(--gold)" : "var(--cream)",
                    background: pathname === l.href ? "rgba(201, 168, 76, 0.15)" : "transparent",
                    fontWeight: pathname === l.href ? 700 : 400,
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(201, 168, 76, 0.2)" }}
            >
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}>
                {session.name} • {roleLabels[session.role]}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded text-xs transition-colors"
                style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold-light)" }}
              >
                خروج
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm transition-all"
      style={{
        color: active ? "var(--gold)" : "var(--cream)",
        background: active ? "rgba(201, 168, 76, 0.15)" : "transparent",
        fontWeight: active ? 700 : 400,
      }}
    >
      {children}
    </a>
  );
}
