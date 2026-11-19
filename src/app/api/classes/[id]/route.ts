import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role !== "MINISTRY_ADMIN") return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  const { id } = await params;
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "اسم الفصل مطلوب" }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}
