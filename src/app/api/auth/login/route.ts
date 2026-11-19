import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "بيانات الدخول غلط" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
