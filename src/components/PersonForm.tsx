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

export default function PersonForm({ person }: { person?: Partial<PersonData> }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [servants, setServants] = useState<ServantOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"basic" | "medical" | "skills">("basic");
  const [form, setForm] = useState<PersonData>({
    ...defaultForm,
    ...person,
  });

  useEffect(() => {
    fetch("/api/classes").then((r) => r.json()).then(setClasses);
    fetch("/api/servants").then((r) => r.json()).then(setServants);
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
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        {label}: <span className="text-blue-700">{skillLabels[form[key] as string] || "متوسط"}</span>
      </label>
      <input
        type="range"
        min="1"
        max="5"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full accent-blue-700"
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {person?.id ? "تعديل حالة" : "إضافة حالة جديدة"}
      </h2>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : person?.id ? "حفظ التعديلات" : "إضافة"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
