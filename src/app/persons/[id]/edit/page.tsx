import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PersonForm from "@/components/PersonForm";


export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });

  if (!person) return notFound();

  return (
    <PersonForm
      person={{
        id: person.id,
        name: person.name,
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
      }}
    />
  );
}
