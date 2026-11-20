import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ClassServantsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  const { id } = await params;

  const cls = await prisma.class.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!cls) notFound();

  const servants = await prisma.servant.findMany({
    where: { persons: { some: { classId: id } } },
    include: {
      persons: {
        where: { classId: id },
        select: { id: true, name: true },
      },
      _count: { select: { persons: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>✝</span> خدام {cls.name}
        </h1>
        <Link href={`/classes/${id}`} className="btn-navy text-sm">
          ← رجوع للفصل
        </Link>
      </div>

      {servants.length === 0 ? (
        <div className="church-card text-center py-16">
          <p className="text-4xl mb-4" style={{ color: "var(--gold)" }}>✝</p>
          <p className="text-lg" style={{ color: "var(--navy-light)" }}>لا يوجد خدام في هذا الفصل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {servants.map((s) => (
            <div key={s.id} className="church-card p-5 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
              {s.photo ? (
                <img
                  src={s.photo}
                  alt={s.name}
                  className="w-20 h-20 mx-auto rounded-full object-cover"
                  style={{ border: "3px solid var(--gold)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl"
                  style={{ background: "var(--gold-pale)", border: "3px solid var(--cream-dark)", color: "var(--gold-dark)" }}
                >
                  ✝
                </div>
              )}
              <h3 className="text-lg font-bold mt-3" style={{ color: "var(--navy)" }}>{s.name}</h3>
              {s.phone && <p className="text-sm mt-1" style={{ color: "var(--navy-light)" }}>{s.phone}</p>}
              <div className="mt-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
                  {s.persons.length} مخدوم في الفصل
                </span>
              </div>
              {s.persons.length > 0 && (
                <div className="mt-3 text-sm space-y-1">
                  {s.persons.map((p) => (
                    <Link key={p.id} href={`/persons/${p.id}`} className="block hover:underline" style={{ color: "var(--navy-light)" }}>
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
