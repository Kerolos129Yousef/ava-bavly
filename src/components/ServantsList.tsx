"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Servant {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  photo: string | null;
  address: string | null;
  education: string | null;
  maritalStatus: string | null;
  job: string | null;
  personsCount: number;
  persons: { id: string; name: string }[];
}

export default function ServantsList({ servants, canAdd = true }: { servants: Servant[]; canAdd?: boolean }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addServant = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/servants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, address, education, maritalStatus, job }),
    });
    if (res.ok) {
      setName(""); setPhone(""); setEmail("");
      setAddress(""); setEducation(""); setMaritalStatus(""); setJob("");
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div>
      {canAdd && (
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-navy mb-4" : "btn-gold mb-4"}
        >
          {showForm ? "إلغاء" : "+ إضافة خادم"}
        </button>
      )}

      {showForm && canAdd && (
        <div className="church-card p-6 mb-6" style={{ borderTop: "3px solid var(--gold)" }}>
          <h3 className="font-bold font-amiri text-lg mb-4" style={{ color: "var(--navy)" }}>
            <span style={{ color: "var(--gold)" }}>☦</span> إضافة خادم جديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الاسم *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>التليفون</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الإيميل</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الوظيفة</label>
              <input value={job} onChange={(e) => setJob(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الدراسة</label>
              <input value={education} onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الحالة الاجتماعية</label>
              <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}>
                <option value="">اختر...</option>
                <option value="أعزب">أعزب</option>
                <option value="متزوج">متزوج</option>
                <option value="مخطوب">مخطوب</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>العنوان</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={addServant} disabled={loading || !name.trim()} className="btn-gold disabled:opacity-50">
              حفظ
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servants.map((s) => (
          <div key={s.id} className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {s.photo ? (
                  <img src={s.photo} alt={s.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    style={{ border: "3px solid var(--gold-pale)" }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "var(--navy)", color: "var(--gold)", border: "3px solid var(--gold-pale)" }}>
                    {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg truncate" style={{ color: "var(--navy)" }}>{s.name}</h3>
                    <Link href={`/servants/${s.id}/edit`}
                      className="text-xs px-2 py-1 rounded hover:opacity-80 flex-shrink-0"
                      style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                      تعديل ✏️
                    </Link>
                  </div>
                  {s.job && <p className="text-sm truncate" style={{ color: "var(--gold-dark)" }}>{s.job}</p>}
                </div>
              </div>

              <div className="space-y-1.5 text-sm" style={{ color: "var(--navy-light)" }}>
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--gold)" }}>📱</span> {s.phone}
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2 truncate">
                    <span style={{ color: "var(--gold)" }}>✉</span> {s.email}
                  </div>
                )}
                {s.education && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--gold)" }}>🎓</span> {s.education}
                  </div>
                )}
                {s.maritalStatus && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--gold)" }}>💍</span> {s.maritalStatus}
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--gold)" }}>📍</span> {s.address}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--cream-dark)" }}>
                <button
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: "var(--gold-dark)" }}
                >
                  <span>{s.personsCount} مخدوم</span>
                  <span className="text-xs">{expandedId === s.id ? "▲" : "▼"}</span>
                </button>
                {expandedId === s.id && s.persons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.persons.map((p) => (
                      <Link key={p.id} href={`/persons/${p.id}`}
                        className="text-xs px-2 py-1 rounded hover:opacity-80"
                        style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {servants.length === 0 && (
          <div className="church-card text-center py-12 col-span-full">
            <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🕊</p>
            <p style={{ color: "var(--navy-light)" }}>لا يوجد خدام مسجلين</p>
          </div>
        )}
      </div>
    </div>
  );
}
