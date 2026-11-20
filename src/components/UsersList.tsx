"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Servant { id: string; name: string }
interface ClassItem { id: string; name: string }
interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  status?: string;
  servantId?: string | null;
  classId?: string | null;
  suspended?: boolean;
}

const roleLabels: Record<string, string> = {
  SERVANT: "خادم",
  CLASS_ADMIN: "أمين فصل",
  CLASS_ASSISTANT: "مساعد أمين الفصل",
  MINISTRY_ADMIN: "أمين الخدمة",
};

const emptyForm = { username: "", password: "", name: "", role: "SERVANT", servantId: "", classId: "" };

export default function UsersList({
  users,
  servants,
  classes,
}: {
  users: User[];
  servants: Servant[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", servantId: "", classId: "", password: "" });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pendingUsers = users.filter((u) => u.status === "PENDING");
  const activeUsers = users.filter((u) => u.status !== "PENDING");

  const handleApprove = async (u: User, role: string, servantId?: string, classId?: string) => {
    setActionLoading(u.id);
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: u.name,
        role,
        status: "APPROVED",
        servantId: servantId || "",
        classId: classId || "",
      }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ");
    }
    setActionLoading(null);
  };

  const handleReject = async (u: User) => {
    if (!confirm(`هل أنت متأكد من رفض طلب "${u.name}"؟`)) return;
    setActionLoading(u.id);
    const res = await fetch(`/api/users/${u.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ");
    }
    setActionLoading(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setLoading(false);
  };

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditForm({
      name: u.name,
      role: u.role,
      servantId: u.servantId || "",
      classId: u.classId || "",
      password: "",
    });
    setEditError("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditLoading(true);
    setEditError("");
    const res = await fetch(`/api/users/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      router.refresh();
    } else {
      const data = await res.json();
      setEditError(data.error);
    }
    setEditLoading(false);
  };

  const handleSuspend = async (u: User) => {
    const action = u.suspended ? "تفعيل" : "تعليق";
    if (!confirm(`هل أنت متأكد من ${action} المستخدم "${u.name}"؟`)) return;
    setSuspendingId(u.id);
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: u.name, role: u.role, servantId: u.servantId || "", classId: u.classId || "", suspended: !u.suspended }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ");
    }
    setSuspendingId(null);
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${u.name}"؟`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ في الحذف");
    }
  };

  return (
    <div>
      {/* Pending Registration Requests */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold font-amiri mb-3 flex items-center gap-2" style={{ color: "var(--navy)" }}>
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: "var(--gold)" }} />
            طلبات تسجيل جديدة ({pendingUsers.length})
          </h2>
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <PendingUserCard
                key={u.id}
                user={u}
                servants={servants}
                classes={classes}
                loading={actionLoading === u.id}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className={showForm ? "btn-navy mb-4" : "btn-gold mb-4"}
      >
        {showForm ? "إلغاء" : "+ إضافة مستخدم"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="church-card p-6 mb-6 space-y-4" style={{ borderTop: "3px solid var(--gold)" }}>
          {error && <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(122, 45, 60, 0.1)", color: "var(--burgundy)" }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الدور</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="SERVANT">خادم</option>
                <option value="CLASS_ADMIN">أمين فصل</option>
                <option value="CLASS_ASSISTANT">مساعد أمين الفصل</option>
                <option value="MINISTRY_ADMIN">أمين الخدمة</option>
              </select>
            </div>
            {form.role === "SERVANT" && (
              <div>
                <label className="block text-sm font-medium mb-1">ربط بخادم</label>
                <select value={form.servantId} onChange={(e) => setForm({ ...form, servantId: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- اختر خادم --</option>
                  {servants.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            {(form.role === "CLASS_ADMIN" || form.role === "CLASS_ASSISTANT") && (
              <div>
                <label className="block text-sm font-medium mb-1">ربط بفصل</label>
                <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  <option value="">-- اختر فصل --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-gold disabled:opacity-50">
            {loading ? "جاري الحفظ..." : "إضافة"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {activeUsers.map((u) => (
          <div key={u.id} className="church-card p-4" style={{ borderRight: `3px solid ${u.suspended ? "var(--burgundy)" : "var(--gold)"}`, opacity: u.suspended ? 0.7 : 1 }}>
            {editingId === u.id ? (
              <form onSubmit={handleEdit} className="space-y-3">
                {editError && <div className="p-2 rounded-lg text-sm" style={{ background: "rgba(122, 45, 60, 0.1)", color: "var(--burgundy)" }}>{editError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">الاسم</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">الدور</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="SERVANT">خادم</option>
                      <option value="CLASS_ADMIN">أمين فصل</option>
                      <option value="CLASS_ASSISTANT">مساعد أمين الفصل</option>
                      <option value="MINISTRY_ADMIN">أمين الخدمة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">كلمة مرور جديدة (اختياري)</label>
                    <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="اتركه فارغ لعدم التغيير" />
                  </div>
                  {editForm.role === "SERVANT" && (
                    <div>
                      <label className="block text-xs font-medium mb-1">ربط بخادم</label>
                      <select value={editForm.servantId} onChange={(e) => setEditForm({ ...editForm, servantId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="">-- اختر خادم --</option>
                        {servants.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  {(editForm.role === "CLASS_ADMIN" || editForm.role === "CLASS_ASSISTANT") && (
                    <div>
                      <label className="block text-xs font-medium mb-1">ربط بفصل</label>
                      <select value={editForm.classId} onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="">-- اختر فصل --</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={editLoading} className="btn-gold text-sm disabled:opacity-50">
                    {editLoading ? "..." : "حفظ"}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-navy text-sm">إلغاء</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold" style={{ color: "var(--navy)" }}>{u.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                      {roleLabels[u.role] || u.role}
                    </span>
                    {u.suspended && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(122, 45, 60, 0.15)", color: "var(--burgundy)" }}>
                        معلّق
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--navy-light)" }}>{u.username}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleSuspend(u)}
                    disabled={suspendingId === u.id}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                    style={{ background: u.suspended ? "rgba(34,139,34,0.1)" : "rgba(122, 45, 60, 0.1)", color: u.suspended ? "#228b22" : "var(--burgundy)" }}
                  >
                    {suspendingId === u.id ? "..." : u.suspended ? "تفعيل" : "تعليق"}
                  </button>
                  <button
                    onClick={() => startEdit(u)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={{ background: "rgba(122, 45, 60, 0.1)", color: "var(--burgundy)" }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {activeUsers.length === 0 && (
          <div className="church-card text-center py-8" style={{ color: "var(--navy-light)" }}>لا يوجد مستخدمين</div>
        )}
      </div>
    </div>
  );
}

function PendingUserCard({
  user,
  servants,
  classes,
  loading,
  onApprove,
  onReject,
}: {
  user: User;
  servants: Servant[];
  classes: ClassItem[];
  loading: boolean;
  onApprove: (u: User, role: string, servantId?: string, classId?: string) => void;
  onReject: (u: User) => void;
}) {
  const [role, setRole] = useState("SERVANT");
  const [servantId, setServantId] = useState("");
  const [classId, setClassId] = useState("");

  return (
    <div className="church-card p-5" style={{ borderRight: "3px solid var(--gold)", background: "var(--gold-pale)" }}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg" style={{ color: "var(--navy)" }}>{user.name}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "var(--gold)", color: "white" }}>
              جديد
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--navy-light)" }}>اسم المستخدم: {user.username}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>الدور</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ background: "white" }}
          >
            <option value="SERVANT">خادم</option>
            <option value="CLASS_ADMIN">أمين فصل</option>
            <option value="CLASS_ASSISTANT">مساعد أمين الفصل</option>
            <option value="MINISTRY_ADMIN">أمين الخدمة</option>
          </select>
        </div>
        {role === "SERVANT" && (
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>ربط بخادم</label>
            <select value={servantId} onChange={(e) => setServantId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ background: "white" }}>
              <option value="">-- اختياري --</option>
              {servants.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {(role === "CLASS_ADMIN" || role === "CLASS_ASSISTANT") && (
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--navy)" }}>ربط بفصل</label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" style={{ background: "white" }}>
              <option value="">-- اختر فصل --</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onApprove(user, role, servantId, classId)}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          style={{ background: "#166534", color: "white" }}
        >
          {loading ? "..." : "✓ موافقة"}
        </button>
        <button
          onClick={() => onReject(user)}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          style={{ background: "var(--burgundy)", color: "white" }}
        >
          {loading ? "..." : "✕ رفض"}
        </button>
      </div>
    </div>
  );
}
