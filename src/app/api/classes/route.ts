import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const classes = await prisma.class.findMany({
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}
