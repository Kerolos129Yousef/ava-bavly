import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendPushToClass } from "@/lib/push";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  const where: any = {};

  if (session.role === "SERVANT") {
    // Servant sees: notifications for their class + global notifications
    where.OR = [
      { classId: null },
      ...(session.classId ? [{ classId: session.classId }] : []),
    ];
  } else if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    // Class admin sees: their class notifications + global
    where.OR = [
      { classId: null },
      ...(session.classId ? [{ classId: session.classId }] : []),
    ];
  }
  // MINISTRY_ADMIN sees all

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, photo: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  if (session.role === "SERVANT") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const { title, body, classId } = await req.json();

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "العنوان والمحتوى مطلوبين" }, { status: 400 });
  }

  // CLASS_ADMIN/CLASS_ASSISTANT can only send to their own class
  if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    if (!classId || classId !== session.classId) {
      return NextResponse.json({ error: "يمكنك الإرسال لفصلك فقط" }, { status: 403 });
    }
  }

  const notification = await prisma.notification.create({
    data: {
      title: title.trim(),
      body: body.trim(),
      senderId: session.id,
      classId: classId || null,
    },
  });

  try {
    await sendPushToClass(classId || null, {
      title: title.trim(),
      body: body.trim(),
      url: "/notifications",
    });
  } catch (e) {
    console.error("Push notification failed:", e);
  }

  return NextResponse.json(notification);
}
