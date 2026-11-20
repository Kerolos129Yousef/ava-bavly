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
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [persons, setPersons] = useState<{ id: string; name: string }[]>([]);

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
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", new File([compressed], "photo.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setPhoto(url);
      } else {
        const err = await res.json();
        alert(err.error || "خطأ في رفع الصورة");
      }
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setClasses(d); });
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
        setClassId(d.class?.id || "");
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
      body: JSON.stringify({ name, phone, email, photo, address, education, maritalStatus, job, classId: classId || null }),
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
          <div className="relative">
            {photo ? (
              <img src={photo} alt={name} className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid var(--gold-pale)" }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "var(--navy)", color: "var(--gold)", border: "3px solid var(--gold-pale)" }}>
                {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>{name}</h2>
            {job && <p className="text-sm" style={{ color: "var(--gold-dark)" }}>{job}</p>}
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80"
                style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                {uploading ? "جاري الرفع..." : photo ? "تغيير الصورة" : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)}
                  className="text-xs hover:opacity-80" style={{ color: "var(--burgundy)" }}>
                  إزالة
                </button>
              )}
            </div>
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
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الفصل</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5"
                style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}>
                <option value="">اختر الفصل...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
