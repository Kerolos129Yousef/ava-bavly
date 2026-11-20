import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationsView from "@/components/NotificationsView";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const where: any = {};
  if (session.role === "SERVANT" || session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    where.OR = [
      { classId: null },
      ...(session.classId ? [{ classId: session.classId }] : []),
    ];
  }

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, photo: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const classes = session.role === "MINISTRY_ADMIN"
    ? await prisma.class.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
    : [];

  const canSend = session.role !== "SERVANT";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>🔔</span> الإشعارات
      </h1>
      <NotificationsView
        notifications={notifications.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          sender: n.sender,
          className: n.class?.name || null,
          createdAt: n.createdAt.toISOString(),
        }))}
        canSend={canSend}
        classes={classes}
        userClassId={session.classId || null}
        role={session.role}
      />
    </div>
  );
}
