import { prisma } from "@/lib/db";
import Link from "next/link";


export default async function PersonsPage() {
  const persons = await prisma.person.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الحالات</h1>
        <Link
          href="/persons/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          + إضافة حالة
        </Link>
      </div>

      {persons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">لا توجد حالات مسجلة</p>
          <Link href="/persons/new" className="text-blue-600 hover:underline mt-2 block">
            أضف أول حالة
          </Link>
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
              {persons.map((p) => (
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
