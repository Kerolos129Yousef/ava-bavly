"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "linear-gradient(180deg, var(--navy-dark) 0%, var(--navy) 50%, var(--navy-light) 100%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-6xl" style={{ color: "var(--gold)" }}>☦</span>
          <h1 className="text-3xl font-bold font-amiri mt-2" style={{ color: "var(--gold-light)" }}>
            أفا بافلي
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cream-dark)" }}>
            خدمة ذوي القدرات الخاصة بالكنيسة
          </p>
          <div className="mt-3 mx-auto w-32 h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "white", border: "1px solid var(--gold-pale)" }}>
          <h2 className="text-xl font-bold text-center mb-1 font-amiri" style={{ color: "var(--navy)" }}>
            {title}
          </h2>
          <p className="text-center mb-6 text-sm" style={{ color: "var(--navy-light)" }}>
            {subtitle}
          </p>

          {error && (
            <div className="p-3 rounded-lg mb-4 text-sm text-center" style={{ background: "#fef2f2", color: "var(--burgundy)", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetup && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الاسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 transition-all"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 transition-all"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)", color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
            >
              {loading ? "جاري..." : isSetup ? "إنشاء الحساب" : "دخول"}
            </button>
          </form>

          {!isSetup && (
            <div className="mt-4 text-center">
              <Link href="/register" className="text-sm underline" style={{ color: "var(--gold-dark)" }}>
                مستخدم جديد؟ سجّل هنا
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(201, 168, 76, 0.5)" }}>
          بركة القديس أنبا بافلي تكون معنا
        </p>
      </div>
    </div>
  );
}
