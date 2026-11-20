"use client";

import { useEffect, useState } from "react";

type OverlayType = "snow" | "stars" | "hearts" | "none";

export default function SeasonalOverlay({ type }: { type: OverlayType }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || type === "none") return null;

  if (type === "snow") return <Snowflakes />;
  if (type === "stars") return <Stars />;
  return null;
}

function Snowflakes() {
  const flakes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 4 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.5,
    char: ["❄", "❅", "❆", "✦", "⁕"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: var(--snow-opacity); }
          90% { opacity: var(--snow-opacity); }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "fixed",
            left: `${f.left}%`,
            top: "-20px",
            fontSize: `${f.size}px`,
            color: "white",
            opacity: f.opacity,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
            ["--snow-opacity" as string]: f.opacity,
          }}
        >
          {f.char}
        </span>
      ))}
      {/* Corner decorations */}
      <div className="fixed top-16 right-2 text-2xl opacity-30 md:text-4xl md:top-20 md:right-6" style={{ color: "#c41e3a" }}>
        🎄
      </div>
      <div className="fixed top-16 left-2 text-2xl opacity-30 md:text-4xl md:top-20 md:left-6" style={{ color: "#d4a017" }}>
        ⭐
      </div>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--star-opacity); transform: scale(1); }
          50% { opacity: 0.1; transform: scale(0.6); }
        }
      `}</style>
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "fixed",
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            color: "#ffd700",
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            ["--star-opacity" as string]: s.opacity,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
