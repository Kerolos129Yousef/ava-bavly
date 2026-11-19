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
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">توصيات AI لـ {personName}</h2>
        <button
          onClick={getRecommendation}
          disabled={loading}
          className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-800 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري التحليل...
            </>
          ) : (
            "🤖 طلب توصيات جديدة"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">جاري تحليل بيانات المخدوم...</p>
          <p className="text-sm">ده ممكن ياخد شوية وقت حسب الموديل</p>
        </div>
      )}

      {recommendations.length === 0 && !loading ? (
        <p className="text-gray-500 text-sm">
          اضغط &quot;طلب توصيات جديدة&quot; عشان الذكاء الاصطناعي يحلل حالة
          المخدوم ويقترح خطة عمل
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <details
              key={rec.id}
              open={i === 0}
              className="border rounded-lg"
            >
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 font-medium text-sm flex justify-between items-center">
                <span>
                  توصية {new Date(rec.createdAt).toLocaleDateString("ar-EG")}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(rec.createdAt).toLocaleTimeString("ar-EG")}
                </span>
              </summary>
              <div className="px-4 pb-4 prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {rec.content}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
