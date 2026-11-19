import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const MAX_SIZE = 500 * 1024; // 500KB after base64

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "images only" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  if (dataUrl.length > MAX_SIZE) {
    return NextResponse.json({ error: "الصورة كبيرة جداً، الحد الأقصى 500KB" }, { status: 400 });
  }

  return NextResponse.json({ url: dataUrl });
}
