import { prisma } from "@/lib/db";
import { getSession, canAccessPerson } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PersonForm from "@/components/PersonForm";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });

  if (!person) return notFound();
  if (!canAccessPerson(session, person)) return notFound();

  return (
    <PersonForm
      userRole={session.role}
      person={{
        id: person.id,
        name: person.name,
        photo: person.photo || "",
        birthDate: person.birthDate
          ? new Date(person.birthDate).toISOString().split("T")[0]
          : "",
        gender: person.gender || "",
        phone: person.phone || "",
        guardianName: person.guardianName || "",
        guardianPhone: person.guardianPhone || "",
        address: person.address || "",
        disabilityType: person.disabilityType || "",
        disabilityCause: person.disabilityCause || "",
        classId: person.classId || "",
        notes: person.notes || "",
        medications: person.medications || "",
        allergies: person.allergies || "",
        medicalHistory: person.medicalHistory || "",
        doctorName: person.doctorName || "",
        doctorPhone: person.doctorPhone || "",
        cognitiveSkills: person.cognitiveSkills || "3",
        physicalSkills: person.physicalSkills || "3",
        socialSkills: person.socialSkills || "3",
        communicationSkills: person.communicationSkills || "3",
        selfCareSkills: person.selfCareSkills || "3",
        dailyLivingNote: person.dailyLivingNote || "",
        servantId: person.servantId || "",
      }}
    />
  );
}
