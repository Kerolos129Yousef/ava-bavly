import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, servantId: true, classId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
