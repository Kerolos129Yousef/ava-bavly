"use client";

import { useState } from "react";
import Link from "next/link";

interface ClassPerson {
  id: string;
  name: string;
  disabilityType: string | null;
}

interface ClassData {
  id: string;
  name: string;
  type: string;
  persons: ClassPerson[];
  _count: { persons: number };
}

const classIcons: Record<string, string> = {
  mild: "🕊",
  moderate: "✝",
  severe: "🙏",
  children: "👶",
};

export default function ClassCard({ cls, canEdit }: { cls: ClassData; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cls.name);
  const [displayName, setDisplayName] = useState(cls.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === displayName) {
      setEditing(false);
      setName(displayName);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/classes/${cls.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDisplayName(updated.name);
        setName(updated.name);
      }
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  return (
    <div className="church-card p-6" style={{ borderTop: "3px solid var(--gold)" }}>
      <div className="flex items-center justify-between mb-4">
        {editing ? (
          <div className="flex items-center gap-2 flex-1 ml-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border text-lg font-bold font-amiri"
              style={{ borderColor: "var(--gold)", color: "var(--navy)" }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") { setEditing(false); setName(displayName); }
              }}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: "var(--gold)", color: "white" }}
            >
              {saving ? "..." : "حفظ"}
            </button>
            <button
              onClick={() => { setEditing(false); setName(displayName); }}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: "var(--cream-dark)", color: "var(--navy)" }}
            >
              إلغاء
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-amiri" style={{ color: "var(--navy)" }}>
              <span className="ml-2">{classIcons[cls.type] || "📖"}</span>
              {displayName}
            </h2>
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg transition-colors text-sm"
                style={{ color: "var(--gold-dark)" }}
                title="تعديل اسم الفصل"
              >
                ✏️
              </button>
            )}
          </div>
        )}
        <span className="px-3 py-1 rounded-full text-sm font-medium shrink-0" style={{ background: "var(--gold-pale)", color: "var(--gold-dark)" }}>
          {cls._count.persons} مخدوم
        </span>
      </div>

      {cls.persons.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين في هذا الفصل</p>
      ) : (
        <ul className="space-y-2">
          {cls.persons.map((p) => (
            <li key={p.id} className="flex justify-between items-center pb-2" style={{ borderBottom: "1px solid var(--gold-pale)" }}>
              <Link href={`/persons/${p.id}`} className="hover:underline" style={{ color: "var(--navy)" }}>
                {p.name}
              </Link>
              <span className="text-sm" style={{ color: "var(--gold-dark)" }}>{p.disabilityType || "—"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
