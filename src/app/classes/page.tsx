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

  const classIcons: Record<string, string> = {
    mild: "🕊",
    moderate: "✝",
    severe: "🙏",
    children: "👶",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> الفصول
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="church-card p-6"
            style={{ borderTop: "3px solid var(--gold)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
                <span className="ml-2">{classIcons[cls.type] || "📖"}</span>
                {cls.name}
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                {cls._count.persons} مخدوم
              </span>
            </div>

            {cls.persons.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين في هذا الفصل</p>
            ) : (
              <ul className="space-y-2">
                {cls.persons.map((p) => (
                  <li key={p.id} className="flex justify-between items-center pb-2" style={{ borderBottom: "1px solid var(--gold-pale)" }}>
                    <Link href={`/persons/${p.id}`} className="hover:underline" style={{ color: "var(--navy)" }}>
                      {p.name}
                    </Link>
                    <span className="text-sm" style={{ color: "var(--gold-dark)" }}>{p.disabilityType || "—"}</span>
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
