"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFading(true);
      const t2 = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t2);
    }, 2500);
    return () => clearTimeout(t1);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#1a2744",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.5s ease",
        opacity: fading ? 0 : 1,
      }}
    >
      <style>{`@keyframes sp{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}`}</style>
      <img
        src="/icons/logo-ava-pavly.png"
        width={120}
        height={120}
        alt=""
        style={{ objectFit: "contain", animation: "sp 1.5s ease-in-out infinite" }}
      />
      <p
        style={{
          color: "#c9a84c",
          fontFamily: "Amiri, serif",
          fontSize: "1.5rem",
          marginTop: "1rem",
          fontWeight: 700,
        }}
      >
        أفا بافلي
      </p>
      <p
        style={{
          color: "#faf6eb",
          fontFamily: "Cairo, sans-serif",
          fontSize: "0.85rem",
          marginTop: "0.25rem",
          opacity: 0.7,
        }}
      >
        خدمة ذوي القدرات الخاصة
      </p>
      <p
        style={{
          color: "#c9a84c",
          fontFamily: "Cairo, sans-serif",
          fontSize: "0.65rem",
          position: "absolute",
          bottom: "2rem",
          opacity: 0.5,
        }}
      >
        إعداد المهندس / كيرلس يوسف — صلوا لأجل الخدمة وضعفي
      </p>
    </div>
  );
}
