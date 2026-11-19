"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ personId }: { personId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المخدوم؟")) return;

    const res = await fetch(`/api/persons/${personId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/persons");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 rounded-lg text-sm hover:opacity-80 transition"
      style={{ background: "var(--burgundy)", color: "white" }}
    >
      حذف
    </button>
  );
}
