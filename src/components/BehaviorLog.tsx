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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">سجل السلوك</h2>

      <div className="border rounded-lg p-4 mb-4 bg-gray-50">
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
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "جاري الحفظ..." : "+ إضافة ملاحظة"}
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500 text-sm">لا توجد ملاحظات سلوكية بعد</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-3 flex justify-between items-start"
            >
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(note.date).toLocaleDateString("ar-EG")}
                </p>
                <p className="text-sm">{note.note}</p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700 text-xs mr-2 shrink-0"
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
