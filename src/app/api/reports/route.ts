import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });
  if (session.role === "SERVANT") {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  let personWhere = {};
  let classWhere = {};
  if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    personWhere = { classId: session.classId };
    classWhere = { id: session.classId };
  }

  const [
    totalPersons,
    classCounts,
    genderCounts,
    disabilityTypes,
    recentBehavior,
    personsWithoutClass,
  ] = await Promise.all([
    prisma.person.count({ where: personWhere }),
    prisma.class.findMany({
      where: classWhere,
      include: { _count: { select: { persons: true } } },
    }),
    prisma.person.groupBy({
      by: ["gender"],
      where: personWhere,
      _count: true,
    }),
    prisma.person.groupBy({
      by: ["disabilityType"],
      where: { ...personWhere, disabilityType: { not: null } },
      _count: true,
    }),
    prisma.behaviorNote.findMany({
      take: 10,
      orderBy: { date: "desc" },
      where: (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") ? { person: { classId: session.classId } } : {},
      include: { person: { select: { name: true } } },
    }),
    prisma.person.count({ where: { ...personWhere, classId: null } }),
  ]);

  return NextResponse.json({
    totalPersons,
    classCounts,
    genderCounts,
    disabilityTypes,
    recentBehavior,
    personsWithoutClass,
  });
}
