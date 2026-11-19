import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  const { id } = await params;
  const servant = await prisma.servant.findUnique({
    where: { id },
    include: { persons: { select: { id: true, name: true } } },
  });
  if (!servant) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(servant);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "أمين الخدمة بس يقدر يعدل" }, { status: 403 });
  }

  const { id } = await params;
  const data = await req.json();
  const servant = await prisma.servant.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      education: data.education || null,
      maritalStatus: data.maritalStatus || null,
      job: data.job || null,
    },
  });
  return NextResponse.json(servant);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "أمين الخدمة بس يقدر يحذف" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.servant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
