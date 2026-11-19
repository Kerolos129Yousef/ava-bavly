import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  let where = {};
  if (session.role === "CLASS_ADMIN" || session.role === "CLASS_ASSISTANT") {
    where = { id: session.classId };
  }

  const classes = await prisma.class.findMany({
    where,
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(classes);
}
