import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  let personWhere = {};
  let classWhere = {};
  if (session.role === "SERVANT") {
    personWhere = { servantId: session.servantId };
  } else if (session.role === "CLASS_ADMIN") {
    personWhere = { classId: session.classId };
    classWhere = { id: session.classId };
  }

  const [totalPersons, classes] = await Promise.all([
    prisma.person.count({ where: personWhere }),
    prisma.class.findMany({
      where: classWhere,
      include: { _count: { select: { persons: true } } },
    }),
  ]);

  const classColors: Record<string, string> = {
    mild: "bg-green-100 border-green-400 text-green-800",
    moderate: "bg-yellow-100 border-yellow-400 text-yellow-800",
    severe: "bg-red-100 border-red-400 text-red-800",
    children: "bg-blue-100 border-blue-400 text-blue-800",
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">خدمة أفا بافلي</h1>
        <p className="text-gray-600">
          {session.role === "SERVANT"
            ? `أهلا ${session.name} - مخدوميك`
            : "خدمة ذوي القدرات الخاصة بالكنيسة"}
        </p>
      </div>

      {session.role !== "SERVANT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className={`border-2 rounded-xl p-6 text-center ${classColors[cls.type] || "bg-gray-100 border-gray-400"}`}
            >
              <h3 className="text-lg font-bold mb-1">{cls.name}</h3>
              <p className="text-3xl font-bold">{cls._count.persons}</p>
              <p className="text-sm mt-1">حالة</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 text-center">
        <p className="text-gray-600 mb-2">
          {session.role === "SERVANT" ? "عدد مخدوميك" : "إجمالي الحالات المسجلة"}
        </p>
        <p className="text-4xl font-bold text-blue-700">{totalPersons}</p>
        <div className="mt-4 flex justify-center gap-4">
          {session.role !== "SERVANT" && (
            <Link
              href="/persons/new"
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
            >
              + إضافة حالة جديدة
            </Link>
          )}
          <Link
            href="/persons"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            عرض الحالات
          </Link>
        </div>
      </div>
    </div>
  );
}
