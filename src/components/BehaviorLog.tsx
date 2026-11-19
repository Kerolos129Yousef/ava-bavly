"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BehaviorNote {
  id: string;
  note: string;
  date: string;
}

export default function BehaviorLog({
  personId,
  notes,
}: {
  personId: string;
  notes: BehaviorNote[];
}) {
  const router = useRouter();
  const [newNote, setNewNote] = useState("");
  const [noteDate, setNoteDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/persons/${personId}/behavior`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote, date: noteDate }),
    });
    if (res.ok) {
      setNewNote("");
      router.refresh();
    }
    setLoading(false);
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm("حذف هذه الملاحظة؟")) return;
    await fetch(`/api/persons/${personId}/behavior?noteId=${noteId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <div className="church-card p-6">
      <h2 className="text-lg font-bold mb-4 font-amiri" style={{ color: "var(--navy)" }}>
        <span style={{ color: "var(--gold)" }}>☦</span> سجل السلوك
      </h2>

      <div className="rounded-lg p-4 mb-4" style={{ border: "1px solid var(--gold-pale)", background: "var(--cream)" }}>
        <div className="flex gap-3 mb-3">
          <input
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="اكتب ملاحظة سلوكية..."
          rows={3}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
        />
        <button
          onClick={addNote}
          disabled={loading || !newNote.trim()}
          className="btn-gold disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "+ إضافة ملاحظة"}
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--navy-light)" }}>لا توجد ملاحظات سلوكية بعد</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg p-3 flex justify-between items-start"
              style={{ border: "1px solid var(--gold-pale)" }}
            >
              <div>
                <p className="text-sm mb-1" style={{ color: "var(--gold-dark)" }}>
                  {new Date(note.date).toLocaleDateString("ar-EG")}
                </p>
                <p className="text-sm">{note.note}</p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-xs mr-2 shrink-0 hover:opacity-70"
                style={{ color: "var(--burgundy)" }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
