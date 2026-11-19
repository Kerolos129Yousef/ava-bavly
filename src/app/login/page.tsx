"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          {isSetup ? "إعداد النظام" : "تسجيل الدخول"}
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          {isSetup
            ? "أنشئ حساب أمين الخدمة الأول"
            : "أفا بافلي - خدمة ذوي القدرات الخاصة"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "جاري..." : isSetup ? "إنشاء الحساب" : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
