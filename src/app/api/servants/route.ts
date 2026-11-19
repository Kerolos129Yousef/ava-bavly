import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  if (session.role === "SERVANT") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  let where = {};
  if (session.role === "CLASS_ADMIN") {
    where = { persons: { some: { classId: session.classId } } };
  }

  const servants = await prisma.servant.findMany({
    where,
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(servants);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "أمين الخدمة بس يقدر يضيف خدام" }, { status: 403 });
  }

  const data = await req.json();
  const servant = await prisma.servant.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
    },
  });
  return NextResponse.json(servant, { status: 201 });
}
