"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ClassOption {
  id: string;
  name: string;
}

interface ServantOption {
  id: string;
  name: string;
}

interface PersonData {
  id?: string;
  name: string;
  photo: string;
  birthDate: string;
  gender: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  disabilityType: string;
  disabilityCause: string;
  classId: string;
  notes: string;
  medications: string;
  allergies: string;
  medicalHistory: string;
  doctorName: string;
  doctorPhone: string;
  cognitiveSkills: string;
  physicalSkills: string;
  socialSkills: string;
  communicationSkills: string;
  selfCareSkills: string;
  dailyLivingNote: string;
  servantId: string;
}

const defaultForm: PersonData = {
  name: "",
  photo: "",
  birthDate: "",
  gender: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  disabilityType: "",
  disabilityCause: "",
  classId: "",
  notes: "",
  medications: "",
  allergies: "",
  medicalHistory: "",
  doctorName: "",
  doctorPhone: "",
  cognitiveSkills: "3",
  physicalSkills: "3",
  socialSkills: "3",
  communicationSkills: "3",
  selfCareSkills: "3",
  dailyLivingNote: "",
  servantId: "",
};

export default function PersonForm({ person, userRole }: { person?: Partial<PersonData>; userRole?: string }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [servants, setServants] = useState<ServantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"basic" | "medical" | "skills">("basic");
  const [form, setForm] = useState<PersonData>({
    ...defaultForm,
    ...person,
  });
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setForm((prev) => ({ ...prev, photo: url }));
    }
    setUploading(false);
  };

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setClasses(d); });
    fetch("/api/servants").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setServants(d); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = person?.id ? `/api/persons/${person.id}` : "/api/persons";
    const method = person?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/persons");
      router.refresh();
    } else {
      alert("حدث خطأ");
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof PersonData, type = "text") => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );

  const textarea = (label: string, key: keyof PersonData, rows = 2) => (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        rows={rows}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );

  const skillLabels: Record<string, string> = {
    "1": "ضعيف جداً",
    "2": "ضعيف",
    "3": "متوسط",
    "4": "جيد",
    "5": "ممتاز",
  };

  const skillSlider = (label: string, key: keyof PersonData) => (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}: <span style={{ color: "var(--gold-dark)" }}>{skillLabels[form[key] as string] || "متوسط"}</span>
      </label>
      <input
        type="range"
        min="1"
        max="5"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full"
                style={{ accentColor: "var(--gold)" }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>ضعيف جداً</span>
        <span>ممتاز</span>
      </div>
    </div>
  );

  const tabs = [
    { id: "basic" as const, label: "بيانات أساسية" },
    { id: "medical" as const, label: "معلومات طبية" },
    { id: "skills" as const, label: "تقييم المهارات" },
  ];

  return (
    <form onSubmit={handleSubmit} className="church-card p-6 max-w-3xl mx-auto" style={{ borderTop: "3px solid var(--gold)" }}>
      <h2 className="text-xl font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> {person?.id ? "تعديل مخدوم" : "إضافة مخدوم جديد"}
      </h2>

      <div className="flex gap-2 mb-6" style={{ borderBottom: "2px solid var(--gold-pale)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-sm font-medium -mb-px transition"
            style={{
              borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
              color: tab === t.id ? "var(--gold-dark)" : "var(--navy-light)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col items-center gap-3">
            {form.photo ? (
              <img
                src={form.photo}
                alt="صورة المخدوم"
                className="w-32 h-32 rounded-full object-cover shadow-md"
                style={{ border: "4px solid var(--gold)" }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl" style={{ background: "var(--gold-pale)", border: "4px solid var(--gold)", color: "var(--gold-dark)" }}>
                👤
              </div>
            )}
            <label className="cursor-pointer px-4 py-2 rounded-lg text-sm" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
              {uploading ? "جاري الرفع..." : form.photo ? "تغيير الصورة" : "رفع صورة"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {field("الاسم *", "name")}
          {field("تاريخ الميلاد", "birthDate", "date")}

          <div>
            <label className="block text-sm font-medium mb-1">النوع</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">اختر</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          {field("التليفون", "phone", "tel")}
          {field("اسم ولي الأمر", "guardianName")}
          {field("تليفون ولي الأمر", "guardianPhone", "tel")}

          <div className="md:col-span-2">
            {field("العنوان", "address")}
          </div>

          {field("نوع الإعاقة", "disabilityType")}
          {field("سبب الإعاقة", "disabilityCause")}

          {userRole !== "SERVANT" && (
            <div>
              <label className="block text-sm font-medium mb-1">الفصل</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">اختر الفصل</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {userRole !== "SERVANT" && (
            <div>
              <label className="block text-sm font-medium mb-1">الخادم المسؤول</label>
              <select
                value={form.servantId}
                onChange={(e) => setForm({ ...form, servantId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">اختر الخادم</option>
                {servants.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {textarea("ملاحظات عامة", "notes", 3)}
        </div>
      )}

      {tab === "medical" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {textarea("الأدوية الحالية", "medications", 3)}
          {textarea("الحساسية", "allergies")}
          {textarea("التاريخ الطبي", "medicalHistory", 4)}
          {field("اسم الطبيب المتابع", "doctorName")}
          {field("تليفون الطبيب", "doctorPhone", "tel")}
        </div>
      )}

      {tab === "skills" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillSlider("المهارات الإدراكية", "cognitiveSkills")}
          {skillSlider("المهارات الجسدية", "physicalSkills")}
          {skillSlider("المهارات الاجتماعية", "socialSkills")}
          {skillSlider("مهارات التواصل", "communicationSkills")}
          {skillSlider("مهارات الرعاية الذاتية", "selfCareSkills")}
          {textarea("ملاحظات عن الحياة اليومية", "dailyLivingNote", 3)}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading || !form.name}
          className="btn-gold disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : person?.id ? "حفظ التعديلات" : "إضافة"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-navy"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
