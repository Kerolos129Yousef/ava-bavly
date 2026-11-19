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

  const classIcons: Record<string, string> = {
    mild: "🕊",
    moderate: "✝",
    severe: "🙏",
    children: "👶",
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>☦</p>
        <h1 className="text-3xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
          خدمة أفا بافلي
        </h1>
        <p className="mt-2" style={{ color: "var(--navy-light)" }}>
          {session.role === "SERVANT"
            ? `أهلاً ${session.name} — مخدوميك`
            : "خدمة ذوي القدرات الخاصة بالكنيسة"}
        </p>
        <div className="mt-3 mx-auto w-24 h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
      </div>

      {/* Class Cards */}
      {session.role !== "SERVANT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="church-card p-6 text-center transition-all"
              style={{ borderTop: "3px solid var(--gold)" }}
            >
              <span className="text-2xl">{classIcons[cls.type] || "📖"}</span>
              <h3 className="text-lg font-bold mt-2" style={{ color: "var(--navy)" }}>{cls.name}</h3>
              <p className="text-3xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{cls._count.persons}</p>
              <p className="text-sm mt-1" style={{ color: "var(--navy-light)" }}>مخدوم</p>
            </div>
          ))}
        </div>
      )}

      {/* Total + Actions */}
      <div className="church-card p-8 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
        <p className="text-sm mb-2" style={{ color: "var(--navy-light)" }}>
          {session.role === "SERVANT" ? "عدد مخدوميك" : "إجمالي المخدومين"}
        </p>
        <p className="text-5xl font-bold" style={{ color: "var(--navy)" }}>{totalPersons}</p>
        <div className="mt-2 mx-auto w-16 h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
        <div className="mt-6 flex justify-center gap-4">
          {session.role !== "SERVANT" && (
            <Link href="/persons/new" className="btn-gold">
              + إضافة مخدوم جديد
            </Link>
          )}
          <Link href="/persons" className="btn-navy">
            عرض المخدومين
          </Link>
        </div>
      </div>
    </div>
  );
}
