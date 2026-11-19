"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditServantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [job, setJob] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [persons, setPersons] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch(`/api/servants/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setName(d.name || "");
        setPhone(d.phone || "");
        setEmail(d.email || "");
        setAddress(d.address || "");
        setEducation(d.education || "");
        setMaritalStatus(d.maritalStatus || "");
        setJob(d.job || "");
        setPhoto(d.photo || null);
        setPersons(d.persons || []);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/servants/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, address, education, maritalStatus, job }),
    });

    if (res.ok) {
      router.push("/servants");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "حدث خطأ");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-lg" style={{ color: "var(--gold)" }}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>☦</span> تعديل بيانات الخادم
        </h1>
        <Link href="/servants" className="btn-navy text-sm">
          ← رجوع
        </Link>
      </div>

      <div className="church-card p-6" style={{ borderTop: "3px solid var(--gold)" }}>
        {/* Photo & Name Header */}
        <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
          {photo ? (
            <img src={photo} alt={name} className="w-20 h-20 rounded-full object-cover"
              style={{ border: "3px solid var(--gold-pale)" }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "var(--navy)", color: "var(--gold)", border: "3px solid var(--gold-pale)" }}>
              {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>{name}</h2>
            {job && <p className="text-sm" style={{ color: "var(--gold-dark)" }}>{job}</p>}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg mb-4 text-sm text-center"
            style={{ background: "#fef2f2", color: "var(--burgundy)", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الاسم *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>التليفون</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الإيميل</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الوظيفة</label>
              <input value={job} onChange={(e) => setJob(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الدراسة</label>
              <input value={education} onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الحالة الاجتماعية</label>
              <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}>
                <option value="">اختر...</option>
                <option value="أعزب">أعزب</option>
                <option value="متزوج">متزوج</option>
                <option value="مخطوب">مخطوب</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>العنوان</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }} />
            </div>
          </div>

          {/* Linked Persons */}
          {persons.length > 0 && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--cream-dark)" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--navy)" }}>المخدومين المرتبطين</label>
              <div className="flex flex-wrap gap-2">
                {persons.map((p) => (
                  <Link key={p.id} href={`/persons/${p.id}`}
                    className="text-sm px-3 py-1.5 rounded-lg hover:opacity-80"
                    style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid var(--cream-dark)" }}>
            <button type="submit" disabled={saving || !name.trim()}
              className="btn-gold disabled:opacity-50 flex-1">
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            <Link href="/servants" className="btn-navy text-center flex-1">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
