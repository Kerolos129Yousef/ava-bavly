"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Servant {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  personsCount: number;
  persons: { id: string; name: string }[];
}

export default function ServantsList({ servants }: { servants: Servant[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const addServant = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/servants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (res.ok) {
      setName("");
      setPhone("");
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 mb-4"
      >
        {showForm ? "إلغاء" : "+ إضافة خادم"}
      </button>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">الاسم *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">التليفون</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={addServant}
            disabled={loading || !name.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            حفظ
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servants.map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-lg mb-1">{s.name}</h3>
            {s.phone && <p className="text-sm text-gray-600">{s.phone}</p>}
            <p className="text-sm text-blue-700 mt-2">
              {s.personsCount} مخدوم
            </p>
            {s.persons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {s.persons.map((p) => (
                  <Link
                    key={p.id}
                    href={`/persons/${p.id}`}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {servants.length === 0 && (
          <p className="text-gray-500 col-span-full">لا يوجد خدام مسجلين</p>
        )}
      </div>
    </div>
  );
}
