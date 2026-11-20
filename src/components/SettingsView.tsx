"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SessionUser {
  id: string;
  name: string;
  photo?: string | null;
  role: string;
}

const roleLabels: Record<string, string> = {
  SERVANT: "خادم",
  CLASS_ADMIN: "أمين فصل",
  CLASS_ASSISTANT: "مساعد أمين الفصل",
  MINISTRY_ADMIN: "أمين الخدمة",
};

export default function SettingsView({ session, username: initialUsername, photo: initialPhoto }: { session: SessionUser; username: string; photo: string | null }) {
  const router = useRouter();
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingUsername, setChangingUsername] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const compressImage = (file: File, maxW = 400, quality = 0.7): Promise<Blob> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
      };
      img.src = URL.createObjectURL(file);
    });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setMessage(null);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setMessage({ type: "error", text: err.error || "خطأ في رفع الصورة" });
        return;
      }
      const { url } = await uploadRes.json();
      const saveRes = await fetch("/api/auth/change-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: url }),
      });
      if (saveRes.ok) {
        setPhoto(url);
        setMessage({ type: "success", text: "تم تغيير الصورة بنجاح" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: "خطأ في حفظ الصورة" });
      }
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    const res = await fetch("/api/auth/change-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: null }),
    });
    if (res.ok) {
      setPhoto(null);
      setMessage({ type: "success", text: "تم إزالة الصورة" });
      router.refresh();
    }
    setPhotoUploading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمة المرور الجديدة غير متطابقة" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "خطأ في تغيير كلمة المرور" });
    }
    setLoading(false);
  };

  const handleChangeUsername = async () => {
    if (!username.trim() || username.length < 3) {
      setMessage({ type: "error", text: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
      return;
    }
    setUsernameLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/change-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "تم تغيير اسم المستخدم بنجاح" });
      setChangingUsername(false);
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "خطأ في تغيير اسم المستخدم" });
    }
    setUsernameLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
        <div className="p-6 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            {photo ? (
              <img src={photo} alt={session.name} className="w-16 h-16 rounded-full object-cover"
                style={{ border: "3px solid var(--gold-pale)" }} />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                  color: "white",
                }}
              >
                {session.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
            )}
            <label
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow"
              style={{ background: "var(--gold)", color: "white", border: "2px solid white" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg font-amiri" style={{ color: "var(--navy)" }}>{session.name}</h2>
            <span
              className="inline-block text-xs mt-1 px-3 py-0.5 rounded-full"
              style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}
            >
              {roleLabels[session.role]}
            </span>
            {photoUploading && (
              <p className="text-xs mt-1" style={{ color: "var(--gold-dark)" }}>جاري رفع الصورة...</p>
            )}
            {photo && !photoUploading && (
              <button onClick={handleRemovePhoto} className="text-xs mt-1 hover:opacity-80" style={{ color: "var(--burgundy)" }}>
                إزالة الصورة
              </button>
            )}
          </div>
        </div>

        {/* Username section */}
        <div className="px-6 pb-6 pt-0" style={{ borderTop: "1px solid var(--cream-dark)" }}>
          <div className="pt-4">
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy-light)" }}>اسم المستخدم</label>
            {!changingUsername ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{username}</span>
                <button
                  onClick={() => setChangingUsername(true)}
                  className="text-xs px-2 py-1 rounded hover:opacity-80"
                  style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}
                >
                  تعديل
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-1.5 text-sm"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                />
                <button
                  onClick={handleChangeUsername}
                  disabled={usernameLoading}
                  className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
                  style={{ background: "var(--gold)", color: "white" }}
                >
                  {usernameLoading ? "..." : "حفظ"}
                </button>
                <button
                  onClick={() => { setChangingUsername(false); setUsername(initialUsername); setMessage(null); }}
                  className="text-xs px-2 py-1.5 rounded"
                  style={{ color: "var(--navy-light)" }}
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
        <div className="p-6">
          <h3 className="font-bold font-amiri mb-4" style={{ color: "var(--navy)" }}>
            🔒 الأمان
          </h3>

          {message && (
            <div
              className="mb-4 px-4 py-2.5 rounded-lg text-sm"
              style={{
                background: message.type === "success" ? "rgba(76, 175, 80, 0.1)" : "rgba(122, 45, 60, 0.1)",
                color: message.type === "success" ? "#2e7d32" : "var(--burgundy)",
                border: `1px solid ${message.type === "success" ? "rgba(76, 175, 80, 0.3)" : "rgba(122, 45, 60, 0.3)"}`,
              }}
            >
              {message.text}
            </div>
          )}

          {!changingPassword ? (
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all hover:shadow"
              style={{ background: "var(--cream)", color: "var(--navy)", border: "1px solid var(--cream-dark)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              تغيير كلمة المرور
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg px-3 py-2"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="btn-gold text-sm disabled:opacity-50"
                >
                  {loading ? "جاري التغيير..." : "حفظ"}
                </button>
                <button
                  onClick={() => { setChangingPassword(false); setMessage(null); }}
                  className="btn-navy text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
        <div className="p-6">
          <h3 className="font-bold font-amiri mb-4" style={{ color: "var(--navy)" }}>
            ℹ️ عن التطبيق
          </h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--navy-light)" }}>
            <div className="flex justify-between">
              <span>الإصدار</span>
              <span style={{ color: "var(--navy)" }}>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>التطبيق</span>
              <span style={{ color: "var(--navy)" }}>أفا بافلي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout — mobile visible, desktop too */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all church-card"
        style={{ color: "var(--burgundy)", border: "1px solid rgba(122, 45, 60, 0.2)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        تسجيل خروج
      </button>
    </div>
  );
}
