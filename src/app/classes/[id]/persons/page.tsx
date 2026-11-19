import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ClassPersonsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!cls) notFound();

  const persons = await prisma.person.findMany({
    where: { classId: id },
    include: { class: true, servant: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>☦</span> مخدومين فصل {cls.name}
        </h1>
        <Link href={`/classes/${id}`} className="btn-navy text-sm">
          ← رجوع للفصل
        </Link>
      </div>

      {persons.length === 0 ? (
        <div className="church-card text-center py-16">
          <p className="text-4xl mb-4" style={{ color: "var(--gold)" }}>🕊</p>
          <p className="text-lg" style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين في هذا الفصل</p>
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
              {p.servant && (
                <span className="text-xs mt-1 px-2 py-0.5 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                  {p.servant.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
