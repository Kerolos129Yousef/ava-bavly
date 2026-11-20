import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  const { endpoint, keys } = await req.json();

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "بيانات الاشتراك غير صالحة" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.id, p256dh: keys.p256dh, auth: keys.auth },
    create: {
      userId: session.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  const { endpoint } = await req.json();

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  return NextResponse.json({ ok: true });
}
