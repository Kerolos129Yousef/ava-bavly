import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });
  }

  const { username } = await req.json();
  if (!username || !username.trim()) {
    return NextResponse.json({ error: "اسم المستخدم مطلوب" }, { status: 400 });
  }

  if (username.length < 3) {
    return NextResponse.json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== session.id) {
    return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { username },
  });

  return NextResponse.json({ ok: true });
}
