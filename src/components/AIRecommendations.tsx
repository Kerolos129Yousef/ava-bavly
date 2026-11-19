"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Recommendation {
  id: string;
  content: string;
  createdAt: string;
}

export default function AIRecommendations({
  personId,
  personName,
  recommendations,
}: {
  personId: string;
  personName: string;
  recommendations: Recommendation[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/persons/${personId}/recommend`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "حدث خطأ");
      }
    } catch {
      setError("تأكد إن Ollama شغال");
    }
    setLoading(false);
  };

  return (
    <div className="church-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-amiri" style={{ color: "var(--navy)" }}>
          <span style={{ color: "var(--gold)" }}>☦</span> توصيات AI لـ {personName}
        </h2>
        <button
          onClick={getRecommendation}
          disabled={loading}
          className="btn-gold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري التحليل...
            </>
          ) : (
            "طلب توصيات جديدة"
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg mb-4 text-sm" style={{ background: "rgba(122, 45, 60, 0.1)", color: "var(--burgundy)" }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8" style={{ color: "var(--navy-light)" }}>
          <p className="text-lg mb-2">جاري تحليل بيانات المخدوم...</p>
          <p className="text-sm">ده ممكن ياخد شوية وقت حسب الموديل</p>
        </div>
      )}

      {recommendations.length === 0 && !loading ? (
        <p className="text-sm" style={{ color: "var(--navy-light)" }}>
          اضغط &quot;طلب توصيات جديدة&quot; عشان الذكاء الاصطناعي يحلل حالة
          المخدوم ويقترح خطة عمل
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <details
              key={rec.id}
              open={i === 0}
              className="rounded-lg"
              style={{ border: "1px solid var(--gold-pale)" }}
            >
              <summary className="px-4 py-3 cursor-pointer font-medium text-sm flex justify-between items-center" style={{ color: "var(--navy)" }}>
                <span>
                  توصية {new Date(rec.createdAt).toLocaleDateString("ar-EG")}
                </span>
                <span className="text-xs" style={{ color: "var(--gold-dark)" }}>
                  {new Date(rec.createdAt).toLocaleTimeString("ar-EG")}
                </span>
              </summary>
              <div className="px-4 pb-4 prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap" style={{ borderTop: "1px solid var(--gold-pale)" }}>
                {rec.content}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
