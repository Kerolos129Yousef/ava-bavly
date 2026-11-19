import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  let where = {};
  if (session.role === "SERVANT") {
    where = { servantId: session.servantId };
  } else if (session.role === "CLASS_ADMIN") {
    where = { classId: session.classId };
  }

  const persons = await prisma.person.findMany({
    where,
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(persons);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role === "SERVANT") {
    return NextResponse.json({ error: "غير مسموح بإضافة حالات" }, { status: 403 });
  }

  const data = await req.json();

  if (session.role === "CLASS_ADMIN" && data.classId !== session.classId) {
    return NextResponse.json({ error: "غير مسموح بإضافة حالات لفصل تاني" }, { status: 403 });
  }

  const person = await prisma.person.create({
    data: {
      name: data.name,
      photo: data.photo || null,
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
  return NextResponse.json(person, { status: 201 });
}
