import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  const note = await prisma.behaviorNote.create({
    data: {
      personId: id,
      note: data.note,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 });
  await prisma.behaviorNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
