import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClassesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  let classWhere = {};
  if (session.role === "CLASS_ADMIN") {
    classWhere = { id: session.classId };
  }

  const classes = await prisma.class.findMany({
    where: classWhere,
    include: {
      persons: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, disabilityType: true },
      },
      _count: { select: { persons: true } },
    },
  });

  const classColors: Record<string, string> = {
    mild: "border-green-400",
    moderate: "border-yellow-400",
    severe: "border-red-400",
    children: "border-blue-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">الفصول</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`bg-white rounded-xl shadow border-r-4 ${classColors[cls.type] || "border-gray-400"} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{cls.name}</h2>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {cls._count.persons} حالة
              </span>
            </div>

            {cls.persons.length === 0 ? (
              <p className="text-gray-500 text-sm">لا توجد حالات في هذا الفصل</p>
            ) : (
              <ul className="space-y-2">
                {cls.persons.map((p) => (
                  <li key={p.id} className="flex justify-between items-center border-b pb-2">
                    <Link href={`/persons/${p.id}`} className="text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                    <span className="text-sm text-gray-500">{p.disabilityType || "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
