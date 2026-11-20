"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("صور فقط"); return; }
    if (file.size > 400 * 1024) { setError("الصورة كبيرة جداً، الحد الأقصى 400KB"); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, phone, nationalId, address, photo }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(data.message);
    } else {
      setError(data.error || "حدث خطأ");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8 scrollbar-hide register-bg">
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
            تسجيل حساب جديد
          </h2>
          <p className="text-center mb-6 text-sm" style={{ color: "var(--navy-light)" }}>
            سجّل بياناتك وانتظر موافقة أمين الخدمة
          </p>

          {error && (
            <div className="p-3 rounded-lg mb-4 text-sm text-center" style={{ background: "#fef2f2", color: "var(--burgundy)", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-lg text-sm" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                {success}
              </div>
              <Link
                href="/login"
                className="inline-block w-full py-2.5 rounded-lg font-bold text-center transition-all"
                style={{ background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)", color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                الرجوع لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-full cursor-pointer flex items-center justify-center overflow-hidden transition-all"
                  style={{
                    border: "3px dashed var(--gold)",
                    background: photo ? "transparent" : "var(--cream)",
                  }}
                >
                  {photo ? (
                    <img src={photo} alt="صورة" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl" style={{ color: "var(--gold)" }}>📷</span>
                      <p className="text-xs mt-1" style={{ color: "var(--navy-light)" }}>صورة شخصية</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الاسم الرباعي</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوحنا ميخائيل سعيد عبدالله"
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>رقم البطاقة</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="الرقم القومي"
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                  required
                  maxLength={14}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>العنوان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>رقم الموبايل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 transition-all"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                />
              </div>

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
                  minLength={8}
                />
                <p className="text-xs mt-1" style={{ color: "var(--navy-light)" }}>8 أحرف على الأقل</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)", color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                {loading ? "جاري..." : "إرسال طلب التسجيل"}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm underline" style={{ color: "var(--gold-dark)" }}>
                عندك حساب؟ سجّل دخول
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
