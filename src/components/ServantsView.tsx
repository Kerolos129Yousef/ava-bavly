"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Person {
  id: string;
  name: string;
  photo: string | null;
}

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
  classId: string | null;
  className: string | null;
  personsCount: number;
  persons: Person[];
}

interface ClassInfo {
  id: string;
  name: string;
}

type ViewMode = "table" | "byClass";

function SmallPhoto({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: "2px solid var(--gold-pale)" }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--gold-pale)",
        color: "var(--gold-dark)",
        fontSize: size * 0.35,
        border: "2px solid var(--cream-dark)",
      }}
    >
      {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
    </div>
  );
}

export default function ServantsView({
  servants,
  classes,
  canAdd = true,
}: {
  servants: Servant[];
  classes: ClassInfo[];
  canAdd?: boolean;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterClassId, setFilterClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [education, setEducation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [job, setJob] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [classId, setClassId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (s: Servant) => {
    if (!confirm(`هل أنت متأكد من حذف الخادم "${s.name}"؟`)) return;
    setDeleting(s.id);
    const res = await fetch(`/api/servants/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ في الحذف");
    }
    setDeleting(null);
  };

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

  const addServant = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/servants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, photo, address, education, maritalStatus, job, classId: classId || null }),
    });
    if (res.ok) {
      setName(""); setPhone(""); setEmail("");
      setAddress(""); setEducation(""); setMaritalStatus(""); setJob("");
      setPhoto(null); setClassId(""); setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const filtered = servants.filter((s) => {
    if (filterClassId && s.classId !== filterClassId) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const searchedServants = searchQuery
    ? servants.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : servants;

  const filteredClasses = filterClassId ? classes.filter((c) => c.id === filterClassId) : classes;

  const groupedByClass = filteredClasses
    .map((c) => ({
      ...c,
      servants: searchedServants.filter((s) => s.classId === c.id),
    }))
    .filter((g) => g.servants.length > 0);

  const unassigned = filterClassId ? [] : searchedServants.filter((s) => !s.classId);

  return (
    <div>
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        {/* View Toggle */}
        <div className="flex rounded-lg overflow-hidden flex-shrink-0" style={{ border: "2px solid var(--gold)" }}>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "table" ? "var(--gold)" : "transparent",
              color: viewMode === "table" ? "white" : "var(--gold-dark)",
            }}
          >
            جدول الكل
          </button>
          <button
            onClick={() => setViewMode("byClass")}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "byClass" ? "var(--gold)" : "transparent",
              color: viewMode === "byClass" ? "white" : "var(--gold-dark)",
            }}
          >
            حسب الفصل
          </button>
        </div>

        {canAdd && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? "btn-navy" : "btn-gold"} text-sm flex-shrink-0`}
          >
            {showForm ? "إلغاء" : "+ إضافة خادم"}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="var(--navy-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="بحث بالاسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg pr-10 pl-3 py-2.5 text-sm"
          style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
        />
      </div>

      {/* Add Form */}
      {showForm && canAdd && (
        <div className="church-card p-6 mb-6" style={{ borderTop: "3px solid var(--gold)" }}>
          <h3 className="font-bold font-amiri text-lg mb-4" style={{ color: "var(--navy)" }}>
            <span style={{ color: "var(--gold)" }}>☦</span> إضافة خادم جديد
          </h3>
          <div className="flex items-center gap-4 mb-4">
            {photo ? (
              <img src={photo} alt="صورة الخادم" className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid var(--gold-pale)" }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "var(--navy)", color: "var(--gold)", border: "3px solid var(--gold-pale)" }}>
                📷
              </div>
            )}
            <div>
              <label className="btn-gold text-sm cursor-pointer inline-block">
                {uploading ? "جاري الرفع..." : photo ? "تغيير الصورة" : "رفع صورة"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)}
                  className="text-xs mr-2 hover:opacity-80" style={{ color: "var(--burgundy)" }}>
                  إزالة
                </button>
              )}
            </div>
          </div>
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
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--navy)" }}>الفصل</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg px-3 py-2" style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)" }}>
                <option value="">اختر الفصل...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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

      {/* Table View */}
      {viewMode === "table" && (
        <div>
          {/* Class filter for table */}
          <div className="mb-4">
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "var(--gold-pale)" }}>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>الخادم</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>الفصل</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>المخدومين</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>التليفون</th>
                    {canAdd && (
                      <th className="px-3 py-3 text-center font-bold" style={{ color: "var(--navy)" }}>إجراء</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: "1px solid var(--cream-dark)",
                        background: i % 2 === 0 ? "transparent" : "var(--cream)",
                      }}
                    >
                      {/* Servant */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <SmallPhoto src={s.photo} name={s.name} size={36} />
                          <Link href={`/servants/${s.id}/edit`} className="font-medium hover:underline" style={{ color: "var(--navy)" }}>
                            {s.name}
                          </Link>
                        </div>
                      </td>
                      {/* Class */}
                      <td className="px-3 py-2.5" style={{ color: "var(--navy-light)" }}>
                        {s.className || "—"}
                      </td>
                      {/* Persons */}
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.persons.slice(0, 3).map((p) => (
                            <Link key={p.id} href={`/persons/${p.id}`} className="flex items-center gap-1 hover:opacity-80">
                              <SmallPhoto src={p.photo} name={p.name} size={24} />
                              <span className="text-xs" style={{ color: "var(--navy-light)" }}>{p.name.split(" ")[0]}</span>
                            </Link>
                          ))}
                          {s.persons.length > 3 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                              +{s.persons.length - 3}
                            </span>
                          )}
                          {s.persons.length === 0 && (
                            <span className="text-xs" style={{ color: "var(--navy-light)" }}>—</span>
                          )}
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="px-3 py-2.5" style={{ color: "var(--navy-light)" }}>
                        {s.phone ? (
                          <a href={`tel:${s.phone}`} style={{ color: "var(--gold-dark)" }}>{s.phone}</a>
                        ) : "—"}
                      </td>
                      {/* Actions */}
                      {canAdd && (
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex justify-center gap-1">
                            <Link href={`/servants/${s.id}/edit`}
                              className="text-xs px-2 py-1 rounded hover:opacity-80"
                              style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                              تعديل
                            </Link>
                            <button
                              onClick={() => handleDelete(s)}
                              disabled={deleting === s.id}
                              className="text-xs px-2 py-1 rounded hover:opacity-80 disabled:opacity-50"
                              style={{ background: "rgba(122, 45, 60, 0.1)", color: "var(--burgundy)" }}>
                              {deleting === s.id ? "..." : "حذف"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={canAdd ? 5 : 4} className="text-center py-8" style={{ color: "var(--navy-light)" }}>
                        لا يوجد خدام
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* By Class View */}
      {viewMode === "byClass" && (
        <div className="space-y-6">
          <div className="mb-2">
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {groupedByClass.map((group) => (
            <div key={group.id} className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--gold-pale)" }}>
                <h3 className="font-bold font-amiri" style={{ color: "var(--navy)" }}>
                  <span style={{ color: "var(--gold-dark)" }}>📖</span> {group.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--gold)", color: "white" }}>
                  {group.servants.length} خادم
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--cream-dark)" }}>
                {group.servants.map((s) => (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <SmallPhoto src={s.photo} name={s.name} size={44} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/servants/${s.id}/edit`} className="font-bold text-sm hover:underline" style={{ color: "var(--navy)" }}>
                        {s.name}
                      </Link>
                      {s.phone && <p className="text-xs" style={{ color: "var(--navy-light)" }}>{s.phone}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.persons.slice(0, 4).map((p) => (
                        <Link key={p.id} href={`/persons/${p.id}`} title={p.name}>
                          <SmallPhoto src={p.photo} name={p.name} size={28} />
                        </Link>
                      ))}
                      {s.persons.length > 4 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                          +{s.persons.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {unassigned.length > 0 && (
            <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--cream-dark)" }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--cream)" }}>
                <h3 className="font-bold font-amiri" style={{ color: "var(--navy-light)" }}>
                  بدون فصل
                </h3>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--cream-dark)", color: "var(--navy-light)" }}>
                  {unassigned.length} خادم
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--cream-dark)" }}>
                {unassigned.map((s) => (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <SmallPhoto src={s.photo} name={s.name} size={44} />
                    <div className="flex-1 min-w-0">
                      <Link href={`/servants/${s.id}/edit`} className="font-bold text-sm hover:underline" style={{ color: "var(--navy)" }}>
                        {s.name}
                      </Link>
                      {s.phone && <p className="text-xs" style={{ color: "var(--navy-light)" }}>{s.phone}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.persons.slice(0, 4).map((p) => (
                        <Link key={p.id} href={`/persons/${p.id}`} title={p.name}>
                          <SmallPhoto src={p.photo} name={p.name} size={28} />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groupedByClass.length === 0 && unassigned.length === 0 && (
            <div className="church-card text-center py-12">
              <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🕊</p>
              <p style={{ color: "var(--navy-light)" }}>لا يوجد خدام مسجلين</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
