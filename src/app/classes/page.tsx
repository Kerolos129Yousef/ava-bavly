import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClassCard from "@/components/ClassCard";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  let classWhere = {};
  if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    classWhere = { id: session.classId };
  }

  const classes = await prisma.class.findMany({
    where: classWhere,
    include: {
      persons: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, disabilityType: true },
      },
      _count: { select: { persons: true } },
    },
  });

  const canEdit = session.role === "MINISTRY_ADMIN";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> الفصول
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls as any} canEdit={canEdit} />
        ))}
      </div>
    </div>
  );
}
