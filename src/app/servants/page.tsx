import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ServantsView from "@/components/ServantsView";

export default async function ServantsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  let where = {};
  if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    where = { persons: { some: { classId: session.classId } } };
  }

  const servants = await prisma.servant.findMany({
    where,
    include: {
      persons: { select: { id: true, name: true, photo: true } },
      class: { select: { id: true, name: true } },
      users: { select: { photo: true }, take: 1 },
      _count: { select: { persons: true } },
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
        <span style={{ color: "var(--gold)" }}>☦</span> الخدام
      </h1>
      <ServantsView
        servants={servants.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          photo: s.photo || s.users[0]?.photo || null,
          address: s.address,
          education: s.education,
          maritalStatus: s.maritalStatus,
          job: s.job,
          classId: s.class?.id || null,
          className: s.class?.name || null,
          personsCount: s._count.persons,
          persons: s.persons,
        }))}
        classes={classes}
        canAdd={session.role === "MINISTRY_ADMIN"}
      />
    </div>
  );
}
