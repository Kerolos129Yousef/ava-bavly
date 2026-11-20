import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PersonsView from "@/components/PersonsView";

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
    include: {
      class: { select: { id: true, name: true } },
      servant: { select: { id: true, name: true, photo: true } },
    },
    orderBy: { name: "asc" },
  });

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> المخدومين
      </h1>
      <PersonsView
        persons={persons.map((p) => ({
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
        classes={classes}
        canAdd={session.role !== "SERVANT"}
        role={session.role}
      />
    </div>
  );
}
