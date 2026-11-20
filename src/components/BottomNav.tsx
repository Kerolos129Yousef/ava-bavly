"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SessionUser {
  id: string;
  name: string;
  photo?: string | null;
  role: string;
}

export default function BottomNav({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications/unread")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [session, pathname]);

  useEffect(() => {
    if (!session || pathname !== "/notifications") return;
    fetch("/api/notifications/seen", { method: "POST" }).then(() => setUnreadCount(0)).catch(() => {});
  }, [session, pathname]);

  if (!session || pathname === "/login") return null;

  const isServant = session.role === "SERVANT";
  const isClassAdmin = session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT";

  const tabs = [
    {
      href: "/classes",
      label: "الفصول",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
      show: !isServant && !isClassAdmin,
    },
    {
      href: "/servants",
      label: "الخدام",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      show: !isServant,
    },
    {
      href: "/persons",
      label: "المخدومين",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      show: true,
    },
    {
      href: "/",
      label: "الرئيسية",
      isCenter: true,
      icon: (active: boolean) => (
        <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "var(--gold)" : "none"} stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      show: true,
    },
    {
      href: "/notifications",
      label: "الإشعارات",
      hasBadge: true,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      show: isServant,
    },
    {
      href: "/reports",
      label: "التقارير",
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--gold)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      show: !isServant,
    },
  ].filter((t) => t.show);

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "var(--navy-dark)",
        borderTop: "1px solid rgba(201, 168, 76, 0.2)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-end justify-around px-2 pt-1 pb-2">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const isCenter = "isCenter" in tab && tab.isCenter;

          if (isCenter) {
            return (
              <a
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-5"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, var(--gold), var(--gold-dark))"
                      : "linear-gradient(135deg, var(--navy), var(--navy-dark))",
                    border: "3px solid var(--navy-dark)",
                    color: active ? "white" : "var(--cream)",
                  }}
                >
                  {tab.icon(active)}
                </div>
                <span
                  className="text-[10px] mt-0.5 font-medium"
                  style={{ color: active ? "var(--gold)" : "var(--cream-dark)" }}
                >
                  {tab.label}
                </span>
              </a>
            );
          }

          const showBadge = "hasBadge" in tab && tab.hasBadge && unreadCount > 0;

          return (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center py-1.5 px-2 min-w-[56px] relative"
            >
              <span className="relative" style={{ color: active ? "var(--gold)" : "var(--cream-dark)" }}>
                {tab.icon(active)}
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1"
                    style={{ background: "var(--burgundy)", color: "white" }}
                  >
                    {unreadCount > 9 ? "+9" : unreadCount}
                  </span>
                )}
              </span>
              <span
                className="text-[10px] mt-1 font-medium"
                style={{ color: active ? "var(--gold)" : "var(--cream-dark)" }}
              >
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
