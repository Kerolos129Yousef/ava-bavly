"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ personId }: { personId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الحالة؟")) return;

    const res = await fetch(`/api/persons/${personId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/persons");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
    >
      حذف
    </button>
  );
}
