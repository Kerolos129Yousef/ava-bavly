"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  sender: { id: string; name: string; photo: string | null };
  className: string | null;
  createdAt: string;
}

interface ClassInfo {
  id: string;
  name: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString("ar-EG");
}

export default function NotificationsView({
  notifications: initialNotifications,
  canSend,
  classes,
  userClassId,
  role,
}: {
  notifications: NotificationItem[];
  canSend: boolean;
  classes: ClassInfo[];
  userClassId: string | null;
  role: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [classId, setClassId] = useState<string>(
    role === "MINISTRY_ADMIN" ? "" : userClassId || ""
  );
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage({ type: "error", text: "العنوان والمحتوى مطلوبين" });
      return;
    }
    setSending(true);
    setMessage(null);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        classId: classId || null,
      }),
    });
    if (res.ok) {
      setMessage({ type: "success", text: "تم إرسال الإشعار بنجاح" });
      setTitle("");
      setBody("");
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "خطأ في الإرسال" });
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      {/* Send notification button */}
      {canSend && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-gold text-sm flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          إرسال إشعار
        </button>
      )}

      {/* Send form */}
      {canSend && showForm && (
        <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
          <div className="p-5 space-y-4">
            <h3 className="font-bold font-amiri" style={{ color: "var(--navy)" }}>
              إرسال إشعار جديد
            </h3>

            {message && (
              <div
                className="px-4 py-2.5 rounded-lg text-sm"
                style={{
                  background: message.type === "success" ? "rgba(76, 175, 80, 0.1)" : "rgba(122, 45, 60, 0.1)",
                  color: message.type === "success" ? "#2e7d32" : "var(--burgundy)",
                  border: `1px solid ${message.type === "success" ? "rgba(76, 175, 80, 0.3)" : "rgba(122, 45, 60, 0.3)"}`,
                }}
              >
                {message.text}
              </div>
            )}

            {/* Target selector — only for MINISTRY_ADMIN */}
            {role === "MINISTRY_ADMIN" && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>
                  إرسال إلى
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
                >
                  <option value="">كل الخدام</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>خدام {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(role === "CLASS_ADMIN" || role === "CLASS_ASSISTANT") && (
              <p className="text-xs" style={{ color: "var(--navy-light)" }}>
                سيتم إرسال الإشعار لخدام فصلك
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>العنوان</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإشعار"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>المحتوى</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="محتوى الإشعار..."
                rows={4}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {sending ? "جاري الإرسال..." : "إرسال"}
              </button>
              <button
                onClick={() => { setShowForm(false); setMessage(null); }}
                className="btn-navy text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications list */}
      {initialNotifications.length === 0 ? (
        <div className="church-card text-center py-12">
          <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🔔</p>
          <p style={{ color: "var(--navy-light)" }}>لا يوجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialNotifications.map((n) => (
            <div
              key={n.id}
              className="church-card overflow-hidden"
              style={{ borderRight: "4px solid var(--gold)" }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm" style={{ color: "var(--navy)" }}>
                      {n.title}
                    </h3>
                    <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: "var(--navy-light)" }}>
                      {n.body}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--cream-dark)" }}>
                  <div className="flex items-center gap-2">
                    {n.sender.photo ? (
                      <img src={n.sender.photo} alt={n.sender.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "var(--gold-pale)", color: "var(--gold-dark)", fontSize: 8 }}
                      >
                        {n.sender.name[0]}
                      </div>
                    )}
                    <span className="text-xs" style={{ color: "var(--navy-light)" }}>{n.sender.name}</span>
                    {n.className && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                        {n.className}
                      </span>
                    )}
                    {!n.className && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--cream)", color: "var(--navy-light)" }}>
                        للجميع
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "var(--navy-light)" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
