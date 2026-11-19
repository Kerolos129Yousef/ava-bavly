import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ error: "في مستخدمين موجودين بالفعل، سجل دخول" }, { status: 400 });
  }

  const { username, password, name } = await req.json();
  if (!username || !password || !name) {
    return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, password: hashed, name, role: "MINISTRY_ADMIN" },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true, name: user.name });
}

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ needsSetup: count === 0 });
}
