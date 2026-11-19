import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "SERVANT") redirect("/");
  const [totalPersons, classes, persons, recentBehavior] = await Promise.all([
    prisma.person.count(),
    prisma.class.findMany({
      include: { _count: { select: { persons: true } } },
    }),
    prisma.person.findMany({
      select: {
        gender: true,
        disabilityType: true,
        classId: true,
        birthDate: true,
        _count: { select: { behaviorNotes: true } },
      },
    }),
    prisma.behaviorNote.findMany({
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
      <h1 className="text-2xl font-bold mb-6">التقارير والإحصائيات</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{totalPersons}</p>
          <p className="text-sm text-gray-600">إجمالي الحالات</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">
            {classes.length}
          </p>
          <p className="text-sm text-gray-600">عدد الفصول</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-orange-700">
            {totalBehaviorNotes}
          </p>
          <p className="text-sm text-gray-600">ملاحظات سلوكية</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{withoutClass}</p>
          <p className="text-sm text-gray-600">بدون فصل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">توزيع الفصول</h2>
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

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">توزيع النوع</h2>
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
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">أنواع الإعاقة</h2>
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
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">الفئات العمرية</h2>
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
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">آخر الملاحظات السلوكية</h2>
        {recentBehavior.length === 0 ? (
          <p className="text-gray-500 text-sm">لا توجد ملاحظات</p>
        ) : (
          <div className="space-y-3">
            {recentBehavior.map((note) => (
              <div key={note.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm text-blue-700">
                    {note.person.name}
                  </span>
                  <span className="text-xs text-gray-500">
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
