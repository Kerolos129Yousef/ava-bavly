import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AssistantPicker from "@/components/AssistantPicker";

const classIcons: Record<string, string> = {
  mild: "🕊",
  moderate: "✝",
  severe: "🙏",
  children: "👶",
};

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, role: true } },
      assistant: { select: { id: true, name: true, photo: true } },
      persons: {
        select: { id: true, name: true, photo: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!cls) notFound();

  // Get servants linked to this class's persons
  const servants = await prisma.servant.findMany({
    where: { persons: { some: { classId: id } } },
    select: { id: true, name: true, photo: true, _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });

  // All servants for picker dropdown
  const allServants = await prisma.servant.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const classAdmin = cls.users.find((u) => u.role === "CLASS_ADMIN");
  const isAdmin = session.role === "MINISTRY_ADMIN";

  return (
    <div>
      {/* Header */}
      <div className="church-card p-6 mb-6 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
        <span className="text-4xl">{classIcons[cls.type] || "📖"}</span>
        <h1 className="text-2xl font-bold font-amiri mt-2" style={{ color: "var(--navy)" }}>
          {cls.name}
        </h1>
        <div className="mt-3 mx-auto w-24 h-0.5" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        {/* Admin & Assistant */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {classAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--gold-pale)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--gold)", color: "white" }}>أ</div>
              <div className="text-start">
                <p className="text-xs" style={{ color: "var(--gold-dark)" }}>أمين الفصل</p>
                <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{classAdmin.name}</p>
              </div>
            </div>
          )}
          {isAdmin ? (
            <AssistantPicker classId={id} currentAssistantId={cls.assistantId} servants={allServants} />
          ) : cls.assistant ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--gold-pale)" }}>
              {cls.assistant.photo ? (
                <img src={cls.assistant.photo} alt={cls.assistant.name} className="w-8 h-8 rounded-full object-cover" style={{ border: "2px solid var(--gold)" }} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--navy)", color: "white" }}>م</div>
              )}
              <div className="text-start">
                <p className="text-xs" style={{ color: "var(--gold-dark)" }}>المساعد</p>
                <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>{cls.assistant.name}</p>
              </div>
            </div>
          ) : null}
        </div>
        {!classAdmin && !cls.assistant && !isAdmin && (
          <p className="mt-3 text-xs" style={{ color: "var(--navy-light)" }}>لم يتم تعيين أمين فصل أو مساعد</p>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Servants */}
        <Link
          href={`/classes/${id}/servants`}
          target="_blank"
          className="church-card p-6 text-center transition-all hover:shadow-lg group"
          style={{ borderTop: "3px solid var(--gold)" }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl transition-all group-hover:scale-110"
            style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
          >
            ✝
          </div>
          <h3 className="text-lg font-bold mt-3 font-amiri" style={{ color: "var(--navy)" }}>الخدام</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{servants.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--navy-light)" }}>اضغط للعرض ↗</p>
        </Link>

        {/* Persons */}
        <Link
          href={`/classes/${id}/persons`}
          target="_blank"
          className="church-card p-6 text-center transition-all hover:shadow-lg group"
          style={{ borderTop: "3px solid var(--gold)" }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl transition-all group-hover:scale-110"
            style={{ background: "var(--gold-pale)", border: "2px solid var(--gold)" }}
          >
            👥
          </div>
          <h3 className="text-lg font-bold mt-3 font-amiri" style={{ color: "var(--navy)" }}>المخدومين</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--gold-dark)" }}>{cls.persons.length}</p>
          <p className="text-xs mt-1" style={{ color: "var(--navy-light)" }}>اضغط للعرض ↗</p>
        </Link>
      </div>

      {/* Servants Preview */}
      {servants.length > 0 && (
        <div className="church-card p-5 mb-4" style={{ borderRight: "3px solid var(--gold)" }}>
          <h3 className="font-bold font-amiri mb-3" style={{ color: "var(--navy)" }}>✝ خدام الفصل</h3>
          <div className="flex flex-wrap gap-3">
            {servants.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--gold-pale)" }}>
                {s.photo ? (
                  <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full object-cover" style={{ border: "2px solid var(--gold)" }} />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "var(--cream-dark)", color: "var(--gold-dark)" }}>✝</div>
                )}
                <span className="text-sm font-medium" style={{ color: "var(--navy)" }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persons Preview */}
      {cls.persons.length > 0 && (
        <div className="church-card p-5" style={{ borderRight: "3px solid var(--gold)" }}>
          <h3 className="font-bold font-amiri mb-3" style={{ color: "var(--navy)" }}>👥 مخدومين الفصل</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {cls.persons.slice(0, 16).map((p) => (
              <Link key={p.id} href={`/persons/${p.id}`} className="flex flex-col items-center text-center group">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid var(--gold-pale)" }} />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>👤</div>
                )}
                <span className="text-xs mt-1 truncate w-full" style={{ color: "var(--navy)" }}>{p.name}</span>
              </Link>
            ))}
          </div>
          {cls.persons.length > 16 && (
            <p className="text-xs text-center mt-3" style={{ color: "var(--navy-light)" }}>
              و {cls.persons.length - 16} مخدوم آخر...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
