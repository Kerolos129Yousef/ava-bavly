"use client";

import { useEffect } from "react";
import { getActiveTheme } from "@/lib/themes";
import SeasonalOverlay from "./SeasonalOverlay";

export default function ThemeProvider() {
  const theme = getActiveTheme();

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty("--navy", c.navy);
    root.style.setProperty("--navy-light", c.navyLight);
    root.style.setProperty("--navy-dark", c.navyDark);
    root.style.setProperty("--gold", c.gold);
    root.style.setProperty("--gold-light", c.goldLight);
    root.style.setProperty("--gold-dark", c.goldDark);
    root.style.setProperty("--gold-pale", c.goldPale);
    root.style.setProperty("--cream", c.cream);
    root.style.setProperty("--cream-dark", c.creamDark);
    if (c.accent) {
      root.style.setProperty("--accent", c.accent);
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", c.navy);
  }, [theme]);

  return <SeasonalOverlay type={theme.overlay} />;
}
