import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ServantsList from "@/components/ServantsList";

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
      persons: { select: { id: true, name: true } },
      _count: { select: { persons: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> الخدام
      </h1>
      <ServantsList
        servants={servants.map((s) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          photo: s.photo,
          address: s.address,
          education: s.education,
          maritalStatus: s.maritalStatus,
          job: s.job,
          personsCount: s._count.persons,
          persons: s.persons,
        }))}
        canAdd={session.role === "MINISTRY_ADMIN"}
      />
    </div>
  );
}
