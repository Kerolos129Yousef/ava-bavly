import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalPersons,
    classCounts,
    genderCounts,
    disabilityTypes,
    recentBehavior,
    personsWithoutClass,
  ] = await Promise.all([
    prisma.person.count(),
    prisma.class.findMany({
      include: { _count: { select: { persons: true } } },
    }),
    prisma.person.groupBy({
      by: ["gender"],
      _count: true,
    }),
    prisma.person.groupBy({
      by: ["disabilityType"],
      _count: true,
      where: { disabilityType: { not: null } },
    }),
    prisma.behaviorNote.findMany({
      take: 10,
      orderBy: { date: "desc" },
      include: { person: { select: { name: true } } },
    }),
    prisma.person.count({ where: { classId: null } }),
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
