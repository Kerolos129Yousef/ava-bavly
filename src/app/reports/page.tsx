import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");

  const isClassScoped = session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT";
  const personWhere = isClassScoped ? { classId: session.classId } : {};
  const classWhere = isClassScoped ? { id: session.classId } : {};
  const behaviorWhere = isClassScoped ? { person: { classId: session.classId } } : {};

  const [totalPersons, classes, persons, recentBehavior] = await Promise.all([
    prisma.person.count({ where: personWhere }),
    prisma.class.findMany({
      where: classWhere,
      include: { _count: { select: { persons: true } } },
    }),
    prisma.person.findMany({
      where: personWhere,
      select: {
        gender: true,
        disabilityType: true,
        classId: true,
        birthDate: true,
        _count: { select: { behaviorNotes: true } },
      },
    }),
    prisma.behaviorNote.findMany({
      where: behaviorWhere,
      take: 15,
      orderBy: { date: "desc" },
      include: { person: { select: { name: true } } },
    }),
  ]);

  const maleCount = persons.filter((p) => p.gender === "male").length;
  const femaleCount = persons.filter((p) => p.gender === "female").length;
  const unspecifiedGender = persons.filter((p) => !p.gender).length;
  const withoutClass = persons.filter((p) => !p.classId).length;

  const disabilityMap: Record<string, number> = {};
  persons.forEach((p) => {
    if (p.disabilityType) {
      disabilityMap[p.disabilityType] = (disabilityMap[p.disabilityType] || 0) + 1;
    }
  });
  const disabilityTypes = Object.entries(disabilityMap).sort(
    (a, b) => b[1] - a[1]
  );

  const now = new Date();
  const ageGroups = { "0-5": 0, "6-12": 0, "13-18": 0, "19-30": 0, "30+": 0, "غير محدد": 0 };
  persons.forEach((p) => {
    if (!p.birthDate) {
      ageGroups["غير محدد"]++;
      return;
    }
    const age = Math.floor(
      (now.getTime() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age <= 5) ageGroups["0-5"]++;
    else if (age <= 12) ageGroups["6-12"]++;
    else if (age <= 18) ageGroups["13-18"]++;
    else if (age <= 30) ageGroups["19-30"]++;
    else ageGroups["30+"]++;
  });

  const totalBehaviorNotes = persons.reduce(
    (sum, p) => sum + p._count.behaviorNotes,
    0
  );

  const classColors: Record<string, string> = {
    mild: "bg-green-500",
    moderate: "bg-yellow-500",
    severe: "bg-red-500",
    children: "bg-blue-500",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> التقارير والإحصائيات
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="church-card p-4 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
          <p className="text-3xl font-bold" style={{ color: "var(--navy)" }}>{totalPersons}</p>
          <p className="text-sm" style={{ color: "var(--gold-dark)" }}>إجمالي المخدومين</p>
        </div>
        {!isClassScoped && (
          <div className="church-card p-4 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
            <p className="text-3xl font-bold" style={{ color: "var(--navy)" }}>
              {classes.length}
            </p>
            <p className="text-sm" style={{ color: "var(--gold-dark)" }}>عدد الفصول</p>
          </div>
        )}
        <div className="church-card p-4 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
          <p className="text-3xl font-bold" style={{ color: "var(--navy)" }}>
            {totalBehaviorNotes}
          </p>
          <p className="text-sm" style={{ color: "var(--gold-dark)" }}>ملاحظات سلوكية</p>
        </div>
        {!isClassScoped && (
          <div className="church-card p-4 text-center" style={{ borderTop: "3px solid var(--gold)" }}>
            <p className="text-3xl font-bold" style={{ color: "var(--burgundy)" }}>{withoutClass}</p>
            <p className="text-sm" style={{ color: "var(--gold-dark)" }}>بدون فصل</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Class Distribution */}
        {!isClassScoped && (
          <div className="church-card p-6">
            <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>توزيع الفصول</h2>
            <div className="space-y-3">
              {classes.map((cls) => {
                const pct =
                  totalPersons > 0
                    ? Math.round((cls._count.persons / totalPersons) * 100)
                    : 0;
                return (
                  <div key={cls.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cls.name}</span>
                      <span>
                        {cls._count.persons} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${classColors[cls.type] || "bg-gray-500"} h-3 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gender Distribution */}
        <div className="church-card p-6">
          <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>توزيع النوع</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-blue-700">
                  {maleCount}
                </span>
              </div>
              <p className="text-sm">ذكور</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-pink-700">
                  {femaleCount}
                </span>
              </div>
              <p className="text-sm">إناث</p>
            </div>
            {unspecifiedGender > 0 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-700">
                    {unspecifiedGender}
                  </span>
                </div>
                <p className="text-sm">غير محدد</p>
              </div>
            )}
          </div>
        </div>

        {/* Disability Types */}
        <div className="church-card p-6">
          <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>أنواع الإعاقة</h2>
          {disabilityTypes.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد بيانات</p>
          ) : (
            <div className="space-y-2">
              {disabilityTypes.map(([type, count]) => (
                <div
                  key={type}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="text-sm">{type}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Age Groups */}
        <div className="church-card p-6">
          <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>الفئات العمرية</h2>
          <div className="space-y-2">
            {Object.entries(ageGroups).map(([group, count]) => (
              <div
                key={group}
                className="flex justify-between items-center border-b pb-2"
              >
                <span className="text-sm">
                  {group === "غير محدد" ? group : `${group} سنة`}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Behavior Notes */}
      <div className="church-card p-6">
        <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>آخر الملاحظات السلوكية</h2>
        {recentBehavior.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--navy-light)" }}>لا توجد ملاحظات</p>
        ) : (
          <div className="space-y-3">
            {recentBehavior.map((note) => (
              <div key={note.id} className="rounded-lg p-3" style={{ border: "1px solid var(--gold-pale)", background: "var(--cream)" }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm" style={{ color: "var(--navy)" }}>
                    {note.person.name}
                  </span>
                  <span className="text-xs" style={{ color: "var(--gold-dark)" }}>
                    {new Date(note.date).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <p className="text-sm">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
