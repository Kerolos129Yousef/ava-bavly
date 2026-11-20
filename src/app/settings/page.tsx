import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsView from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { username: true, photo: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>⚙️</span> الإعدادات
      </h1>
      <SettingsView session={session} username={user?.username || ""} photo={user?.photo || null} />
    </div>
  );
}
