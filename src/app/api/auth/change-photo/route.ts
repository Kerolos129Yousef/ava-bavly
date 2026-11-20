import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });
  }

  const { photo } = await req.json();

  await prisma.user.update({
    where: { id: session.id },
    data: { photo: photo || null },
  });

  return NextResponse.json({ ok: true });
}
