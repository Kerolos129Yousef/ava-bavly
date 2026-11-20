"use client";

import { useEffect, useState } from "react";

type OverlayType = "snow" | "stars" | "hearts" | "none";

export default function SeasonalOverlay({ type }: { type: OverlayType }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || type === "none") return null;

  if (type === "snow") return <ChristmasOverlay />;
  if (type === "stars") return <Stars />;
  return null;
}

function ChristmasOverlay() {
  const flakes = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 10,
    size: 6 + Math.random() * 18,
    opacity: 0.4 + Math.random() * 0.5,
    char: ["❄", "❅", "❆", "✦", "•"][Math.floor(Math.random() * 5)],
    sway: (Math.random() - 0.5) * 60,
  }));

  const ornaments = [
    { color: "#c41e3a", x: 8, size: 20 },
    { color: "#ffd700", x: 25, size: 16 },
    { color: "#c41e3a", x: 42, size: 14 },
    { color: "#228B22", x: 58, size: 18 },
    { color: "#ffd700", x: 75, size: 15 },
    { color: "#c41e3a", x: 92, size: 17 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: var(--snow-opacity); }
          50% { transform: translateY(50vh) translateX(var(--sway)) rotate(180deg); }
          90% { opacity: var(--snow-opacity); }
          100% { transform: translateY(100vh) translateX(calc(var(--sway) * -1)) rotate(360deg); opacity: 0; }
        }
        @keyframes swing {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.4); }
        }
        @keyframes candyRotate {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
      `}</style>

      {/* Snow */}
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "fixed",
            left: `${f.left}%`,
            top: "-30px",
            fontSize: `${f.size}px`,
            color: "white",
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
            ["--snow-opacity" as string]: f.opacity,
            ["--sway" as string]: `${f.sway}px`,
          }}
        >
          {f.char}
        </span>
      ))}

      {/* Top garland with ornament balls */}
      <div className="fixed top-12 left-0 right-0 md:top-14" style={{ zIndex: 51 }}>
        {/* Garland string */}
        <svg width="100%" height="50" viewBox="0 0 1000 50" preserveAspectRatio="none" style={{ position: "absolute", top: 0 }}>
          <path
            d="M0,5 Q125,45 250,5 Q375,45 500,5 Q625,45 750,5 Q875,45 1000,5"
            fill="none"
            stroke="#228B22"
            strokeWidth="6"
            opacity="0.5"
          />
          <path
            d="M0,5 Q125,45 250,5 Q375,45 500,5 Q625,45 750,5 Q875,45 1000,5"
            fill="none"
            stroke="#2d8b2d"
            strokeWidth="3"
            opacity="0.4"
          />
        </svg>

        {/* Hanging ornament balls */}
        {ornaments.map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${o.x}%`,
              top: i % 2 === 0 ? "30px" : "20px",
              animation: `swing ${2 + i * 0.3}s ease-in-out infinite`,
              transformOrigin: "top center",
            }}
          >
            {/* String */}
            <div style={{ width: 1, height: 10, background: "rgba(255,215,0,0.5)", margin: "0 auto" }} />
            {/* Ball */}
            <div
              style={{
                width: o.size,
                height: o.size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${o.color}ee, ${o.color}88)`,
                boxShadow: `0 0 8px ${o.color}66, inset 0 -3px 6px rgba(0,0,0,0.3)`,
                animation: `glow ${3 + i * 0.5}s ease-in-out infinite`,
              }}
            >
              {/* Highlight */}
              <div
                style={{
                  width: o.size * 0.3,
                  height: o.size * 0.3,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.4)",
                  margin: `${o.size * 0.15}px 0 0 ${o.size * 0.2}px`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Candy canes — bottom corners */}
      <div className="fixed bottom-20 left-2 md:bottom-4 md:left-4 opacity-30" style={{ fontSize: 40, animation: "candyRotate 3s ease-in-out infinite" }}>
        🍬
      </div>
      <div className="fixed bottom-20 right-2 md:bottom-4 md:right-4 opacity-30" style={{ fontSize: 40, animation: "candyRotate 3.5s ease-in-out infinite", animationDelay: "1s" }}>
        🍭
      </div>

      {/* Corner Christmas trees */}
      <div className="fixed top-16 right-1 text-3xl opacity-25 md:text-5xl md:right-4">
        🎄
      </div>
      <div className="fixed top-16 left-1 text-3xl opacity-25 md:text-5xl md:left-4">
        🎄
      </div>

      {/* Stars */}
      <div className="fixed top-14 left-1/4 text-lg opacity-20" style={{ animation: "glow 2s ease-in-out infinite" }}>⭐</div>
      <div className="fixed top-20 right-1/3 text-sm opacity-15" style={{ animation: "glow 3s ease-in-out infinite" }}>✨</div>
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
