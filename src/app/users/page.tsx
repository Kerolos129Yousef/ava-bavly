import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersList from "@/components/UsersList";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "MINISTRY_ADMIN") redirect("/");

  const [users, servants, classes] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, status: true, servantId: true, classId: true, suspended: true, photo: true, phone: true, nationalId: true, address: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.servant.findMany({ select: { id: true, name: true } }),
    prisma.class.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> إدارة المستخدمين
      </h1>
      <UsersList users={users} servants={servants} classes={classes} />
    </div>
  );
}
