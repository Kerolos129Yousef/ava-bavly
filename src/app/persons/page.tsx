import { prisma } from "@/lib/db";
import Link from "next/link";
import PersonsTable from "@/components/PersonsTable";

export default async function PersonsPage() {
  const [persons, classes] = await Promise.all([
    prisma.person.findMany({
      include: { class: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

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
        <PersonsTable
          persons={persons.map((p) => ({
            id: p.id,
            name: p.name,
            disabilityType: p.disabilityType,
            guardianName: p.guardianName,
            class: p.class ? { id: p.class.id, name: p.class.name } : null,
          }))}
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        />
      )}
    </div>
  );
}
