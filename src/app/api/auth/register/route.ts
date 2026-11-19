import { prisma } from "@/lib/db";
import { hashPassword, createSession, getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "أمين الخدمة بس يقدر يضيف مستخدمين" }, { status: 403 });
  }

  const { username, password, name, role, servantId, classId } = await req.json();

  if (!username || !password || !name || !role) {
    return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "اسم المستخدم موجود" }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashed, name, role, servantId: servantId || null, classId: classId || null },
  });

  return NextResponse.json({ id: user.id, name: user.name, role: user.role });
}
