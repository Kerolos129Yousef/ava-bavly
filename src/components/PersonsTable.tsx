"use client";

import Link from "next/link";
import { useState } from "react";

interface Person {
  id: string;
  name: string;
  disabilityType: string | null;
  guardianName: string | null;
  class: { id: string; name: string } | null;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function PersonsTable({
  persons,
  classes,
}: {
  persons: Person[];
  classes: ClassOption[];
}) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const filtered = persons.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.includes(query) ||
      (p.disabilityType && p.disabilityType.includes(query)) ||
      (p.guardianName && p.guardianName.includes(query));

    const matchesClass =
      !classFilter ||
      (classFilter === "none" ? !p.class : p.class?.id === classFilter);

    return matchesQuery && matchesClass;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو نوع الإعاقة أو ولي الأمر..."
            className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {filtered.length}/{persons.length}
          </span>
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">كل الفصول</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">بدون فصل</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>لا توجد نتائج</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">الاسم</th>
                <th className="px-4 py-3 font-semibold">الفصل</th>
                <th className="px-4 py-3 font-semibold">نوع الإعاقة</th>
                <th className="px-4 py-3 font-semibold">ولي الأمر</th>
                <th className="px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.class?.name || "—"}</td>
                  <td className="px-4 py-3">{p.disabilityType || "—"}</td>
                  <td className="px-4 py-3">{p.guardianName || "—"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/persons/${p.id}`}
                      className="text-blue-600 hover:underline ml-3"
                    >
                      عرض
                    </Link>
                    <Link
                      href={`/persons/${p.id}/edit`}
                      className="text-green-600 hover:underline"
                    >
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
