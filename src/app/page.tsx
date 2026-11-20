import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PersonsView from "@/components/PersonsView";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  let personWhere = {};
  let classWhere = {};
  if (session.role === "SERVANT") {
    personWhere = { servantId: session.servantId };
  } else if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    personWhere = { classId: session.classId };
    classWhere = { id: session.classId };
  }

  const [totalPersons, totalServants, classes, persons] = await Promise.all([
    prisma.person.count({ where: personWhere }),
    session.role !== "SERVANT" ? prisma.servant.count() : Promise.resolve(0),
    prisma.class.findMany({
      where: classWhere,
      include: { _count: { select: { persons: true } } },
    }),
    session.role === "SERVANT"
      ? prisma.person.findMany({
          where: personWhere,
          include: {
            class: { select: { id: true, name: true } },
            servant: { select: { id: true, name: true, photo: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const classIcons: Record<string, string> = {
    mild: "🕊",
    moderate: "✝",
    severe: "🙏",
    children: "👶",
  };

  const isAdmin = session.role === "MINISTRY_ADMIN";

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

      {/* Quick Nav Cards for Admin */}
      {session.role !== "SERVANT" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/classes"
            className="church-card p-5 text-center transition-all hover:shadow-lg group"
            style={{ borderTop: "3px solid var(--gold)" }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110"
              style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
            >
              📖
            </div>
            <h3 className="text-sm font-bold mt-2 font-amiri" style={{ color: "var(--navy)" }}>الفصول</h3>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{classes.length}</p>
          </Link>

          <Link
            href="/servants"
            className="church-card p-5 text-center transition-all hover:shadow-lg group"
            style={{ borderTop: "3px solid var(--gold)" }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110"
              style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
            >
              ✝
            </div>
            <h3 className="text-sm font-bold mt-2 font-amiri" style={{ color: "var(--navy)" }}>الخدام</h3>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{totalServants}</p>
          </Link>

          <Link
            href="/persons"
            className="church-card p-5 text-center transition-all hover:shadow-lg group"
            style={{ borderTop: "3px solid var(--gold)" }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110"
              style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
            >
              👥
            </div>
            <h3 className="text-sm font-bold mt-2 font-amiri" style={{ color: "var(--navy)" }}>المخدومين</h3>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{totalPersons}</p>
          </Link>

          <Link
            href="/reports"
            className="church-card p-5 text-center transition-all hover:shadow-lg group"
            style={{ borderTop: "3px solid var(--gold)" }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110"
              style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
            >
              📊
            </div>
            <h3 className="text-sm font-bold mt-2 font-amiri" style={{ color: "var(--navy)" }}>التقارير</h3>
            <p className="text-xs mt-2" style={{ color: "var(--navy-light)" }}>عرض ↗</p>
          </Link>
        </div>
      )}

      {/* Class Cards */}
      {session.role !== "SERVANT" && (
        <div className="mb-6">
          <h2 className="text-xl font-bold font-amiri mb-4" style={{ color: "var(--navy)" }}>
            <span style={{ color: "var(--gold)" }}>📖</span> الفصول
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/classes/${cls.id}`}
                className="church-card p-5 text-center transition-all hover:shadow-lg"
                style={{ borderTop: "3px solid var(--gold)" }}
              >
                <span className="text-2xl">{classIcons[cls.type] || "📖"}</span>
                <h3 className="text-base font-bold mt-2" style={{ color: "var(--navy)" }}>{cls.name}</h3>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{cls._count.persons}</p>
                <p className="text-xs mt-1" style={{ color: "var(--navy-light)" }}>مخدوم</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Servant: show persons directly */}
      {session.role === "SERVANT" && (
        <PersonsView
          persons={persons.map((p: any) => ({
            id: p.id,
            name: p.name,
            photo: p.photo,
            phone: p.phone,
            guardianName: p.guardianName,
            guardianPhone: p.guardianPhone,
            classId: p.class?.id || null,
            className: p.class?.name || null,
            servant: p.servant ? { id: p.servant.id, name: p.servant.name, photo: p.servant.photo } : null,
          }))}
          classes={[]}
          canAdd={false}
          role="SERVANT"
        />
      )}
    </div>
  );
}
