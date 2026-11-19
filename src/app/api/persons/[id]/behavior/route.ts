import { prisma } from "@/lib/db";
import { getSession, canAccessPerson } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessPerson(session, person)) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مسموح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "Missing noteId" }, { status: 400 });

  const note = await prisma.behaviorNote.findUnique({ where: { id: noteId }, include: { person: true } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessPerson(session, note.person)) {
    return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
  }

  await prisma.behaviorNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
