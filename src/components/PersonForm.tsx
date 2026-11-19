"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ClassOption {
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
}

export default function PersonForm({ person }: { person?: PersonData }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PersonData>({
    name: person?.name || "",
    birthDate: person?.birthDate || "",
    gender: person?.gender || "",
    phone: person?.phone || "",
    guardianName: person?.guardianName || "",
    guardianPhone: person?.guardianPhone || "",
    address: person?.address || "",
    disabilityType: person?.disabilityType || "",
    disabilityCause: person?.disabilityCause || "",
    classId: person?.classId || "",
    notes: person?.notes || "",
  });

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses);
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {person?.id ? "تعديل حالة" : "إضافة حالة جديدة"}
      </h2>

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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

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
