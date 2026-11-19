"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Servant { id: string; name: string }

export default function AssistantPicker({
  classId,
  currentAssistantId,
  servants,
}: {
  classId: string;
  currentAssistantId: string | null;
  servants: Servant[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(currentAssistantId || "");

  const handleChange = async (newVal: string) => {
    setValue(newVal);
    setSaving(true);
    await fetch(`/api/classes/${classId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantId: newVal || null }),
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "var(--gold-pale)" }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--navy)", color: "white" }}>م</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: "var(--gold-dark)" }}>المساعد</p>
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className="w-full text-sm font-bold border-none bg-transparent py-0.5 disabled:opacity-50"
          style={{ color: "var(--navy)" }}
        >
          <option value="">-- اختر مساعد --</option>
          {servants.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
