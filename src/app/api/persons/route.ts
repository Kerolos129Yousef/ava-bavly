import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const persons = await prisma.person.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(persons);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const person = await prisma.person.create({
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
  return NextResponse.json(person, { status: 201 });
}
