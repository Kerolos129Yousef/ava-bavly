import { prisma } from "@/lib/db";
import { getSession, canAccessPerson } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import BehaviorLog from "@/components/BehaviorLog";
import AIRecommendations from "@/components/AIRecommendations";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

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
  if (!canAccessPerson(session, person)) return notFound();

  const canEdit = session.role !== "SERVANT" || session.servantId === person.servantId;
  const canDelete = session.role !== "SERVANT";

  const skillLabels: Record<string, string> = {
    "1": "ضعيف جداً",
    "2": "ضعيف",
    "3": "متوسط",
    "4": "جيد",
    "5": "ممتاز",
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
      {/* Photo + Name Header */}
      <div className="church-card p-8 flex flex-col items-center text-center" style={{ borderTop: "3px solid var(--gold)" }}>
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="w-36 h-36 rounded-full object-cover shadow-lg"
            style={{ border: "4px solid var(--gold)" }}
          />
        ) : (
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center text-5xl shadow-lg"
            style={{ background: "var(--gold-pale)", border: "4px solid var(--gold)", color: "var(--gold-dark)" }}
          >
            👤
          </div>
        )}
        <h1 className="text-2xl font-bold font-amiri mt-4" style={{ color: "var(--navy)" }}>{person.name}</h1>
        {person.class && (
          <span className="text-sm mt-1 px-3 py-1 rounded-full" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
            {person.class.name}
          </span>
        )}
        {person.servant && (
          <span className="text-xs mt-2" style={{ color: "var(--navy-light)" }}>
            ☦ الخادم: {person.servant.name}
          </span>
        )}
        <div className="flex gap-2 mt-4">
          {canEdit && (
            <Link href={`/persons/${person.id}/edit`} className="btn-gold text-sm">
              تعديل
            </Link>
          )}
          {canDelete && <DeleteButton personId={person.id} />}
        </div>
      </div>

      {/* Basic Info */}
      <div className="church-card p-6">
        <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>☦</span> البيانات الأساسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {info.map(
            ([label, value]) =>
              value && (
                <div key={label as string}>
                  <p className="text-sm" style={{ color: "var(--gold-dark)" }}>{label as string}</p>
                  <p className="font-medium" style={{ color: "var(--navy)" }}>{value as string}</p>
                </div>
              )
          )}
        </div>

        {person.notes && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--gold-pale)" }}>
            <p className="text-sm" style={{ color: "var(--gold-dark)" }}>ملاحظات</p>
            <p style={{ color: "var(--navy)" }}>{person.notes}</p>
          </div>
        )}
      </div>

      {/* Medical Info */}
      {hasMedical && (
        <div className="church-card p-6">
          <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>
            <span style={{ color: "var(--gold)" }}>☦</span> المعلومات الطبية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {person.medications && (
              <div>
                <p className="text-sm" style={{ color: "var(--gold-dark)" }}>الأدوية</p>
                <p className="whitespace-pre-wrap" style={{ color: "var(--navy)" }}>{person.medications}</p>
              </div>
            )}
            {person.allergies && (
              <div>
                <p className="text-sm" style={{ color: "var(--gold-dark)" }}>الحساسية</p>
                <p style={{ color: "var(--navy)" }}>{person.allergies}</p>
              </div>
            )}
            {person.medicalHistory && (
              <div className="md:col-span-2">
                <p className="text-sm" style={{ color: "var(--gold-dark)" }}>التاريخ الطبي</p>
                <p className="whitespace-pre-wrap" style={{ color: "var(--navy)" }}>{person.medicalHistory}</p>
              </div>
            )}
            {person.doctorName && (
              <div>
                <p className="text-sm" style={{ color: "var(--gold-dark)" }}>الطبيب المتابع</p>
                <p style={{ color: "var(--navy)" }}>{person.doctorName} {person.doctorPhone && `- ${person.doctorPhone}`}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Assessment */}
      {hasSkills && (
        <div className="church-card p-6">
          <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>
            <span style={{ color: "var(--gold)" }}>☦</span> تقييم المهارات
          </h2>
          <div className="space-y-3">
            {skills.map(([label, value]) => {
              if (!value) return null;
              const v = value as string;
              const pct = (parseInt(v) / 5) * 100;
              return (
                <div key={label as string}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--navy)" }}>{label as string}</span>
                    <span className="font-medium" style={{ color: "var(--gold-dark)" }}>{skillLabels[v] || "متوسط"}</span>
                  </div>
                  <div className="w-full rounded-full h-3" style={{ background: "var(--cream-dark)" }}>
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold-light))" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {person.dailyLivingNote && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--gold-pale)" }}>
              <p className="text-sm" style={{ color: "var(--gold-dark)" }}>ملاحظات الحياة اليومية</p>
              <p style={{ color: "var(--navy)" }}>{person.dailyLivingNote}</p>
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
