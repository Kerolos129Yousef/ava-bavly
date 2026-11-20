"use client";

import { useEffect, useState } from "react";
import { getActiveTheme } from "@/lib/themes";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const theme = getActiveTheme();

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFading(true);
      const t2 = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t2);
    }, 1200);
    return () => clearTimeout(t1);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: theme.splashBg,
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
          color: theme.colors.gold,
          fontFamily: "Amiri, serif",
          fontSize: "1.5rem",
          marginTop: "1rem",
          fontWeight: 700,
        }}
      >
        {theme.emoji} أفا بافلي
      </p>
      <p
        style={{
          color: theme.colors.cream,
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
          color: theme.colors.gold,
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
