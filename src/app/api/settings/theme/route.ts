import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "themeOverride" } });
    return NextResponse.json({ theme: setting?.value || "auto" });
  } catch {
    return NextResponse.json({ theme: "auto" });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "MINISTRY_ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { theme } = await req.json();
  const valid = ["auto", "default", "christmas", "easter", "lent"];
  if (!valid.includes(theme)) {
    return NextResponse.json({ error: "ثيم غير صالح" }, { status: 400 });
  }

  if (theme === "auto") {
    await prisma.setting.deleteMany({ where: { key: "themeOverride" } });
  } else {
    await prisma.setting.upsert({
      where: { key: "themeOverride" },
      update: { value: theme },
      create: { key: "themeOverride", value: theme },
    });
  }

  return NextResponse.json({ ok: true, theme });
}
