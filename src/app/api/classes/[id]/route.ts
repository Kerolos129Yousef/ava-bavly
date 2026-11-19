import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role !== "MINISTRY_ADMIN") return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  const { id } = await params;
  const { name, assistantId } = await req.json();

  const data: Record<string, unknown> = {};

  if (name?.trim()) {
    data.name = name.trim();
  }

  if (assistantId !== undefined) {
    data.assistantId = assistantId || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "لا يوجد بيانات للتحديث" }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
