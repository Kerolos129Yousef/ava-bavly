import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, role: true, servantId: true, classId: true },
  });
  if (!user) return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  const { id } = await params;
  const { name, role, servantId, classId, password } = await req.json();

  if (!name?.trim() || !role) {
    return NextResponse.json({ error: "الاسم والدور مطلوبين" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    name: name.trim(),
    role,
    servantId: role === "SERVANT" ? (servantId || null) : null,
    classId: role === "CLASS_ADMIN" ? (classId || null) : null,
  };

  if (password?.trim()) {
    data.password = await hashPassword(password.trim());
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id, name: updated.name, role: updated.role });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN")
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json({ error: "لا يمكنك حذف نفسك" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
