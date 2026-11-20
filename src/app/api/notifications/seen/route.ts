import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.id },
    data: { lastSeenNotifications: new Date() },
  });

  return NextResponse.json({ ok: true });
}
