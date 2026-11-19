import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      class: true,
      servant: true,
      behaviorNotes: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const skillLabels: Record<string, string> = {
    "1": "ضعيف جداً",
    "2": "ضعيف",
    "3": "متوسط",
    "4": "جيد",
    "5": "ممتاز",
  };

  const age = person.birthDate
    ? Math.floor(
        (Date.now() - new Date(person.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const behaviorSummary = person.behaviorNotes
    .map(
      (n) =>
        `- ${new Date(n.date).toLocaleDateString("ar-EG")}: ${n.note}`
    )
    .join("\n");

  const prompt = `أنت متخصص في تأهيل ذوي القدرات الخاصة وتعمل مع خدمة كنسية لرعاية هؤلاء الأشخاص. أنا خادم مسؤول عن هذا المخدوم وأحتاج توصياتك المهنية.

## بيانات المخدوم:
- الاسم: ${person.name}
- العمر: ${age ? `${age} سنة` : "غير محدد"}
- النوع: ${person.gender === "male" ? "ذكر" : person.gender === "female" ? "أنثى" : "غير محدد"}
- نوع الإعاقة: ${person.disabilityType || "غير محدد"}
- سبب الإعاقة: ${person.disabilityCause || "غير محدد"}
- الفصل: ${person.class?.name || "غير محدد"}

## المعلومات الطبية:
- الأدوية: ${person.medications || "لا يوجد"}
- الحساسية: ${person.allergies || "لا يوجد"}
- التاريخ الطبي: ${person.medicalHistory || "لا يوجد"}

## تقييم المهارات:
- المهارات الإدراكية: ${skillLabels[person.cognitiveSkills || "3"]}
- المهارات الجسدية: ${skillLabels[person.physicalSkills || "3"]}
- المهارات الاجتماعية: ${skillLabels[person.socialSkills || "3"]}
- مهارات التواصل: ${skillLabels[person.communicationSkills || "3"]}
- مهارات الرعاية الذاتية: ${skillLabels[person.selfCareSkills || "3"]}
${person.dailyLivingNote ? `- ملاحظات الحياة اليومية: ${person.dailyLivingNote}` : ""}

## ملاحظات عامة:
${person.notes || "لا يوجد"}

## سجل السلوك الأخير:
${behaviorSummary || "لا توجد ملاحظات سلوكية"}

---

بناءً على كل المعلومات أعلاه، أرجو تقديم التوصيات التالية بشكل منظم:

1. **تحليل الحالة**: ملخص قصير لفهم حالة المخدوم
2. **المهارات الأولوية**: ما هي المهارات التي يجب التركيز عليها حالياً ولماذا؟
3. **خطة عمل مقترحة**: أنشطة وتمارين محددة يمكن عملها في الخدمة (إدراكية، جسدية، اجتماعية، تواصل)
4. **الأدوات والوسائل**: أدوات تعليمية أو حسية مقترحة
5. **نصائح للخادم**: إرشادات للتعامل مع المخدوم بناءً على حالته
6. **تنبيهات طبية**: أي ملاحظات مهمة بناءً على الأدوية أو الحالة الطبية

أجب بالعربية بشكل واضح ومنظم.`;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 2000 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Ollama error: ${err}` },
        { status: 502 }
      );
    }

    const result = await res.json();
    const content = result.response;

    const saved = await prisma.aIRecommendation.create({
      data: { personId: id, content },
    });

    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json(
      {
        error: `تأكد إن Ollama شغال على ${OLLAMA_URL} والموديل ${OLLAMA_MODEL} متحمّل`,
      },
      { status: 502 }
    );
  }
}
