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
}

const roleLabels: Record<string, string> = {
  SERVANT: "خادم",
  CLASS_ADMIN: "أمين فصل",
  MINISTRY_ADMIN: "أمين الخدمة",
};

const roleBadgeColor: Record<string, string> = {
  SERVANT: "bg-blue-100 text-blue-800",
  CLASS_ADMIN: "bg-green-100 text-green-800",
  MINISTRY_ADMIN: "bg-purple-100 text-purple-800",
};

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
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "SERVANT",
    servantId: "",
    classId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setForm({ username: "", password: "", name: "", role: "SERVANT", servantId: "", classId: "" });
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 mb-4"
      >
        {showForm ? "إلغاء" : "+ إضافة مستخدم"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الاسم</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الدور</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="SERVANT">خادم</option>
                <option value="CLASS_ADMIN">أمين فصل</option>
                <option value="MINISTRY_ADMIN">أمين الخدمة</option>
              </select>
            </div>

            {form.role === "SERVANT" && (
              <div>
                <label className="block text-sm font-medium mb-1">ربط بخادم</label>
                <select
                  value={form.servantId}
                  onChange={(e) => setForm({ ...form, servantId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">-- اختر خادم --</option>
                  {servants.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {form.role === "CLASS_ADMIN" && (
              <div>
                <label className="block text-sm font-medium mb-1">ربط بفصل</label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">-- اختر فصل --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "إضافة"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium">الاسم</th>
              <th className="px-4 py-3 text-right text-sm font-medium">المستخدم</th>
              <th className="px-4 py-3 text-right text-sm font-medium">الدور</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor[u.role] || ""}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">لا يوجد مستخدمين</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
