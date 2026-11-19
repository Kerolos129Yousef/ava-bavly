import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import BehaviorLog from "@/components/BehaviorLog";


export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      class: true,
      behaviorNotes: { orderBy: { date: "desc" } },
    },
  });

  if (!person) return notFound();

  const info = [
    ["تاريخ الميلاد", person.birthDate ? new Date(person.birthDate).toLocaleDateString("ar-EG") : null],
    ["النوع", person.gender === "male" ? "ذكر" : person.gender === "female" ? "أنثى" : null],
    ["التليفون", person.phone],
    ["ولي الأمر", person.guardianName],
    ["تليفون ولي الأمر", person.guardianPhone],
    ["العنوان", person.address],
    ["نوع الإعاقة", person.disabilityType],
    ["سبب الإعاقة", person.disabilityCause],
    ["الفصل", person.class?.name],
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{person.name}</h1>
          <div className="flex gap-2">
            <Link
              href={`/persons/${person.id}/edit`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              تعديل
            </Link>
            <DeleteButton personId={person.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info.map(
            ([label, value]) =>
              value && (
                <div key={label as string}>
                  <p className="text-sm text-gray-500">{label as string}</p>
                  <p className="font-medium">{value as string}</p>
                </div>
              )
          )}
        </div>

        {person.notes && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-500">ملاحظات</p>
            <p>{person.notes}</p>
          </div>
        )}
      </div>

      <BehaviorLog
        personId={person.id}
        notes={person.behaviorNotes.map((n) => ({
          id: n.id,
          note: n.note,
          date: n.date.toISOString(),
        }))}
      />
    </div>
  );
}
