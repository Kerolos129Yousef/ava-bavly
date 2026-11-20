"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getActiveTheme } from "@/lib/themes";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const theme = getActiveTheme();
  const isChristmas = theme.id === "christmas";

  useEffect(() => {
    fetch("/api/auth/setup").then((r) => r.json()).then((d) => setIsSetup(d.needsSetup));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isSetup ? "/api/auth/setup" : "/api/auth/login";
    const body = isSetup ? { username, password, name } : { username, password };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "حدث خطأ");
    }
    setLoading(false);
  };

  const title = isSetup ? "إعداد النظام" : "تسجيل الدخول";
  const subtitle = isSetup ? "أنشئ حساب أمين الخدمة الأول" : "سجّل دخولك للمتابعة";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: isChristmas
          ? "linear-gradient(180deg, #091409 0%, #0d1a0d 40%, #1a2e1a 100%)"
          : "linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)",
      }}
    >
      {/* Christmas decorations on login */}
      {isChristmas && (
        <>
          <style>{`
            @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            @keyframes twinkle2 { 0%,100%{opacity:0.3} 50%{opacity:1} }
            @keyframes gentleSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
          `}</style>
          {/* Big Christmas tree */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-7xl md:text-9xl opacity-80" style={{ animation: "float 4s ease-in-out infinite", filter: "drop-shadow(0 0 20px rgba(0,100,0,0.5))" }}>
            🎄
          </div>
          {/* Star on top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-3xl md:text-4xl" style={{ animation: "twinkle2 2s ease-in-out infinite", filter: "drop-shadow(0 0 10px #ffd700)" }}>
            ⭐
          </div>
          {/* Ornaments around */}
          <div className="absolute top-32 left-4 text-2xl opacity-40" style={{ animation: "float 3s ease-in-out infinite" }}>🔴</div>
          <div className="absolute top-40 right-4 text-xl opacity-40" style={{ animation: "float 3.5s ease-in-out infinite" }}>🟡</div>
          <div className="absolute bottom-32 left-6 text-2xl opacity-30" style={{ animation: "float 4s ease-in-out infinite" }}>🎁</div>
          <div className="absolute bottom-40 right-6 text-xl opacity-30" style={{ animation: "float 2.5s ease-in-out infinite" }}>🎅</div>
          {/* Candy canes */}
          <div className="absolute bottom-24 left-1/4 text-3xl opacity-25" style={{ transform: "rotate(-30deg)" }}>🍬</div>
          <div className="absolute bottom-24 right-1/4 text-3xl opacity-25" style={{ transform: "rotate(30deg)" }}>🍭</div>
          {/* Snow on ground */}
          <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.08), transparent)" }} />
        </>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          {!isChristmas && (
            <span className="text-6xl" style={{ color: "var(--gold)" }}>☦</span>
          )}
          <h1 className="text-3xl font-bold font-amiri mt-2" style={{ color: "var(--gold-light)" }}>
            {isChristmas ? "🎄 أفا بافلي 🎄" : "أفا بافلي"}
          </h1>
          <p className="text-sm mt-1" style={{ color: isChristmas ? "rgba(255,255,255,0.7)" : "var(--cream-dark)" }}>
            {isChristmas ? "🎅 كل سنة وأنتم طيبين — ميلاد مجيد 🌟" : "خدمة ذوي القدرات الخاصة بالكنيسة"}
          </p>
          <div
            className="mt-3 mx-auto w-32 h-0.5"
            style={{
              background: isChristmas
                ? "linear-gradient(90deg, transparent, #c41e3a, #ffd700, #c41e3a, transparent)"
                : "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }}
          />
        </div>

        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: isChristmas ? "rgba(26, 46, 26, 0.9)" : "white",
            border: isChristmas ? "2px solid rgba(196, 30, 58, 0.4)" : "1px solid var(--gold-pale)",
            backdropFilter: isChristmas ? "blur(10px)" : undefined,
          }}
        >
          {isChristmas && (
            <div className="text-center text-2xl mb-3 space-x-1">
              <span>🔴</span><span>🟡</span><span>🟢</span><span>🔴</span><span>🟡</span>
            </div>
          )}

          <h2
            className="text-xl font-bold text-center mb-1 font-amiri"
            style={{ color: isChristmas ? "#ffd700" : "var(--navy)" }}
          >
            {title}
          </h2>
          <p
            className="text-center mb-6 text-sm"
            style={{ color: isChristmas ? "rgba(255,255,255,0.6)" : "var(--navy-light)" }}
          >
            {subtitle}
          </p>

          {error && (
            <div
              className="p-3 rounded-lg mb-4 text-sm text-center"
              style={{
                background: isChristmas ? "rgba(196, 30, 58, 0.2)" : "#fef2f2",
                color: isChristmas ? "#ff9999" : "var(--burgundy)",
                border: isChristmas ? "1px solid rgba(196, 30, 58, 0.4)" : "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetup && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: isChristmas ? "#ffd700" : "var(--navy)" }}>الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{
                    border: isChristmas ? "2px solid rgba(255, 215, 0, 0.3)" : "2px solid var(--cream-dark)",
                    background: isChristmas ? "rgba(13, 26, 13, 0.8)" : "var(--cream)",
                    color: isChristmas ? "white" : undefined,
                  }}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: isChristmas ? "#ffd700" : "var(--navy)" }}>اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 transition-all"
                style={{
                  border: isChristmas ? "2px solid rgba(255, 215, 0, 0.3)" : "2px solid var(--cream-dark)",
                  background: isChristmas ? "rgba(13, 26, 13, 0.8)" : "var(--cream)",
                  color: isChristmas ? "white" : undefined,
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: isChristmas ? "#ffd700" : "var(--navy)" }}>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 transition-all"
                style={{
                  border: isChristmas ? "2px solid rgba(255, 215, 0, 0.3)" : "2px solid var(--cream-dark)",
                  background: isChristmas ? "rgba(13, 26, 13, 0.8)" : "var(--cream)",
                  color: isChristmas ? "white" : undefined,
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
              style={{
                background: isChristmas
                  ? "linear-gradient(135deg, #c41e3a 0%, #8B0000 100%)"
                  : "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
                color: "white",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                boxShadow: isChristmas ? "0 4px 15px rgba(196, 30, 58, 0.4)" : undefined,
              }}
            >
              {loading ? "جاري..." : isSetup ? "إنشاء الحساب" : isChristmas ? "🎄 دخول" : "دخول"}
            </button>
          </form>

          {!isSetup && (
            <div className="mt-4 text-center">
              <Link href="/register" className="text-sm underline" style={{ color: isChristmas ? "#ffd700" : "var(--gold-dark)" }}>
                مستخدم جديد؟ سجّل هنا
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: isChristmas ? "rgba(255, 215, 0, 0.4)" : "rgba(201, 168, 76, 0.5)" }}>
          {isChristmas ? "🌟 المجد لله في الأعالي وعلى الأرض السلام 🌟" : "بركة القديس أنبا بافلي تكون معنا"}
        </p>
      </div>
    </div>
  );
}
