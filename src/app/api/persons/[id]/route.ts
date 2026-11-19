import { prisma } from "@/lib/db";
import { getSession, canAccessPerson } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: { class: true, behaviorNotes: true, servant: true, aiRecommendations: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessPerson(session, person)) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  return NextResponse.json(person);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.person.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessPerson(session, existing)) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  const data = await req.json();
  const person = await prisma.person.update({
    where: { id },
    data: {
      name: data.name,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      phone: data.phone || null,
      guardianName: data.guardianName || null,
      guardianPhone: data.guardianPhone || null,
      address: data.address || null,
      disabilityType: data.disabilityType || null,
      disabilityCause: data.disabilityCause || null,
      classId: data.classId || null,
      notes: data.notes || null,
      medications: data.medications || null,
      allergies: data.allergies || null,
      medicalHistory: data.medicalHistory || null,
      doctorName: data.doctorName || null,
      doctorPhone: data.doctorPhone || null,
      cognitiveSkills: data.cognitiveSkills || null,
      physicalSkills: data.physicalSkills || null,
      socialSkills: data.socialSkills || null,
      communicationSkills: data.communicationSkills || null,
      selfCareSkills: data.selfCareSkills || null,
      dailyLivingNote: data.dailyLivingNote || null,
      servantId: data.servantId || null,
    },
  });
  return NextResponse.json(person);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role === "SERVANT") {
    return NextResponse.json({ error: "غير مسموح بالحذف" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.person.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "CLASS_ADMIN" && existing.classId !== session.classId) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  await prisma.person.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
