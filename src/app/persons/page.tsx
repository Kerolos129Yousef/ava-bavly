import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PersonsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let personWhere = {};
  if (session.role === "SERVANT") {
    personWhere = { servantId: session.servantId };
  } else if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    personWhere = { classId: session.classId };
  }

  const persons = await prisma.person.findMany({
    where: personWhere,
    include: { class: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>☦</span> المخدومين
        </h1>
        {session.role !== "SERVANT" && (
          <Link href="/persons/new" className="btn-gold">
            + إضافة مخدوم
          </Link>
        )}
      </div>

      {persons.length === 0 ? (
        <div className="church-card text-center py-16">
          <p className="text-4xl mb-4" style={{ color: "var(--gold)" }}>🕊</p>
          <p className="text-lg" style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين مسجلين</p>
          {session.role !== "SERVANT" && (
            <Link href="/persons/new" className="btn-gold inline-block mt-4">
              أضف أول مخدوم
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {persons.map((p) => (
            <Link
              key={p.id}
              href={`/persons/${p.id}`}
              className="church-card p-4 flex flex-col items-center text-center group transition-all"
            >
              {p.photo ? (
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-24 h-24 rounded-full object-cover transition-all group-hover:border-gold"
                  style={{ border: "3px solid var(--gold-pale)" }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all"
                  style={{ background: "var(--gold-pale)", border: "3px solid var(--cream-dark)", color: "var(--gold-dark)" }}
                >
                  👤
                </div>
              )}
              <h3 className="mt-3 font-bold text-sm" style={{ color: "var(--navy)" }}>{p.name}</h3>
              {p.class && (
                <span className="text-xs mt-1 px-2 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                  {p.class.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
