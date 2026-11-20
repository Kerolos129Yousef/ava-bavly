import { prisma } from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { password: hashed },
  });

  return NextResponse.json({ ok: true });
}
