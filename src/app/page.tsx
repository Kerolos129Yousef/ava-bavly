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
  } else if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    personWhere = { classId: session.classId };
    classWhere = { id: session.classId };
  }

  const [totalPersons, totalServants, classes, persons] = await Promise.all([
    prisma.person.count({ where: personWhere }),
    session.role !== "SERVANT"
      ? prisma.servant.count({
          where: session.classId && session.role !== "MINISTRY_ADMIN"
            ? { classId: session.classId }
            : {},
        })
      : Promise.resolve(0),
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
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {isAdmin && (
            <Link
              href="/classes"
              className="church-card p-5 text-center transition-all hover:shadow-lg group w-40"
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
          )}

          <Link
            href="/servants"
            className="church-card p-5 text-center transition-all hover:shadow-lg group w-40"
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
            className="church-card p-5 text-center transition-all hover:shadow-lg group w-40"
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
            className="church-card p-5 text-center transition-all hover:shadow-lg group w-40"
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
      {isAdmin && (
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
        <div>
          {persons.length === 0 ? (
            <div className="church-card text-center py-12">
              <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🕊</p>
              <p style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين مسجلين</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5">
              {persons.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/persons/${p.id}`}
                  className="church-card overflow-hidden hover:shadow-lg transition-shadow block w-full max-w-xs"
                  style={{ borderTop: "3px solid var(--gold)" }}
                >
                  <div className="p-6 flex flex-col items-center text-center">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="rounded-full object-cover"
                        style={{ width: 96, height: 96, border: "3px solid var(--gold-pale)" }}
                      />
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: 96,
                          height: 96,
                          background: "var(--gold-pale)",
                          color: "var(--gold-dark)",
                          fontSize: 32,
                          border: "3px solid var(--cream-dark)",
                        }}
                      >
                        {p.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <p className="font-bold text-lg mt-3 font-amiri" style={{ color: "var(--navy)" }}>{p.name}</p>
                    {p.class && (
                      <span className="text-xs mt-1 px-3 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                        {p.class.name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
