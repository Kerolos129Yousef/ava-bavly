import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const servants = await prisma.servant.findMany({
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(servants);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const servant = await prisma.servant.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
    },
  });
  return NextResponse.json(servant, { status: 201 });
}
