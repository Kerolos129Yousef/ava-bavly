import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });
  }

  const { photo } = await req.json();

  const photoValue = photo || null;

  await prisma.user.update({
    where: { id: session.id },
    data: { photo: photoValue },
  });

  if (session.servantId) {
    await prisma.servant.update({
      where: { id: session.servantId },
      data: { photo: photoValue },
    });
  }

  return NextResponse.json({ ok: true });
}
