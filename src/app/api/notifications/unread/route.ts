import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { lastSeenNotifications: true, classId: true, role: true },
  });

  const where: any = {};

  if (user?.lastSeenNotifications) {
    where.createdAt = { gt: user.lastSeenNotifications };
  }

  if (user?.role === "SERVANT" || user?.role === "CLASS_ADMIN" || user?.role === "CLASS_ASSISTANT") {
    where.OR = [
      { classId: null },
      ...(user.classId ? [{ classId: user.classId }] : []),
    ];
  }

  const count = await prisma.notification.count({ where });

  return NextResponse.json({ count });
}
