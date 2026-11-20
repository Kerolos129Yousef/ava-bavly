import { prisma } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";
import { sendPushToUsers } from "@/lib/push";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const { username, password, name, role, servantId, classId, photo, phone, nationalId, address } = await req.json();

  if (!username?.trim() || !password?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
  }

  if (password.trim().length < 8) {
    return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    return NextResponse.json({ error: "اسم المستخدم موجود بالفعل" }, { status: 409 });
  }

  // Admin creating a user directly (approved immediately)
  if (session && session.role === "MINISTRY_ADMIN" && role) {
    const hashed = await hashPassword(password.trim());
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashed,
        name: name.trim(),
        role,
        status: "APPROVED",
        servantId: servantId || null,
        classId: classId || null,
      },
    });
    return NextResponse.json({ id: user.id, name: user.name, role: user.role });
  }

  // Public registration (pending approval)
  if (!name?.trim() || !nationalId?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "الاسم الرباعي ورقم البطاقة والعنوان مطلوبين" }, { status: 400 });
  }

  const hashed = await hashPassword(password.trim());
  await prisma.user.create({
    data: {
      username: username.trim(),
      password: hashed,
      name: name.trim(),
      role: "SERVANT",
      status: "PENDING",
      photo: photo || null,
      phone: phone?.trim() || null,
      nationalId: nationalId.trim(),
      address: address.trim(),
    },
  });

  // Notify admins
  const admins = await prisma.user.findMany({
    where: { role: "MINISTRY_ADMIN" },
    select: { id: true },
  });
  if (admins.length > 0) {
    try {
      await sendPushToUsers(
        admins.map((a) => a.id),
        { title: "طلب تسجيل جديد", body: `${name.trim()} يريد الانضمام`, url: "/users" }
      );
    } catch {}
  }

  return NextResponse.json({ ok: true, message: "تم إرسال طلب التسجيل — في انتظار موافقة أمين الخدمة" });
}
