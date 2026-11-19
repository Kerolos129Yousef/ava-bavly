import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import BehaviorLog from "@/components/BehaviorLog";
import AIRecommendations from "@/components/AIRecommendations";

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
      servant: true,
      behaviorNotes: { orderBy: { date: "desc" } },
      aiRecommendations: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!person) return notFound();

  const skillLabels: Record<string, string> = {
    "1": "ضعيف جداً",
    "2": "ضعيف",
    "3": "متوسط",
    "4": "جيد",
    "5": "ممتاز",
  };

  const skillColor: Record<string, string> = {
    "1": "bg-red-500",
    "2": "bg-orange-500",
    "3": "bg-yellow-500",
    "4": "bg-green-500",
    "5": "bg-emerald-500",
  };

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
    ["الخادم المسؤول", person.servant?.name],
  ];

  const skills = [
    ["المهارات الإدراكية", person.cognitiveSkills],
    ["المهارات الجسدية", person.physicalSkills],
    ["المهارات الاجتماعية", person.socialSkills],
    ["مهارات التواصل", person.communicationSkills],
    ["مهارات الرعاية الذاتية", person.selfCareSkills],
  ];

  const hasSkills = skills.some(([, v]) => v);
  const hasMedical = person.medications || person.allergies || person.medicalHistory;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow p-6">
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

      {/* Medical Info */}
      {hasMedical && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">المعلومات الطبية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {person.medications && (
              <div>
                <p className="text-sm text-gray-500">الأدوية</p>
                <p className="whitespace-pre-wrap">{person.medications}</p>
              </div>
            )}
            {person.allergies && (
              <div>
                <p className="text-sm text-gray-500">الحساسية</p>
                <p>{person.allergies}</p>
              </div>
            )}
            {person.medicalHistory && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">التاريخ الطبي</p>
                <p className="whitespace-pre-wrap">{person.medicalHistory}</p>
              </div>
            )}
            {person.doctorName && (
              <div>
                <p className="text-sm text-gray-500">الطبيب المتابع</p>
                <p>{person.doctorName} {person.doctorPhone && `- ${person.doctorPhone}`}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Assessment */}
      {hasSkills && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">تقييم المهارات</h2>
          <div className="space-y-3">
            {skills.map(([label, value]) => {
              if (!value) return null;
              const v = value as string;
              const pct = (parseInt(v) / 5) * 100;
              return (
                <div key={label as string}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label as string}</span>
                    <span className="font-medium">{skillLabels[v] || "متوسط"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${skillColor[v] || "bg-gray-500"} h-3 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {person.dailyLivingNote && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-500">ملاحظات الحياة اليومية</p>
              <p>{person.dailyLivingNote}</p>
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <AIRecommendations
        personId={person.id}
        personName={person.name}
        recommendations={person.aiRecommendations.map((r) => ({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

      {/* Behavior Log */}
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
