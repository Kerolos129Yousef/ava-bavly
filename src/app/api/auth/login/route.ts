import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "بيانات الدخول غلط" }, { status: 401 });
  }

  if (user.status === "PENDING") {
    return NextResponse.json({ error: "طلب التسجيل في انتظار موافقة أمين الخدمة" }, { status: 403 });
  }

  if (user.status === "REJECTED") {
    return NextResponse.json({ error: "تم رفض طلب التسجيل — تواصل مع أمين الخدمة" }, { status: 403 });
  }

  if (user.suspended) {
    return NextResponse.json({ error: "الحساب معلّق — تواصل مع أمين الخدمة" }, { status: 403 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
