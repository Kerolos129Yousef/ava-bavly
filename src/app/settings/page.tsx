import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsView from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>⚙️</span> الإعدادات
      </h1>
      <SettingsView session={session} />
    </div>
  );
}
