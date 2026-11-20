import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import ThemeProvider from "@/components/ThemeProvider";
import RegisterSW from "@/components/RegisterSW";
import PushSubscriber from "@/components/PushSubscriber";

export const metadata: Metadata = {
  title: "أفا بافلي - خدمة ذوي القدرات الخاصة",
  description: "نظام إدارة خدمة ذوي القدرات الخاصة بالكنيسة",
appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "أفا بافلي",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2744",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let themeOverride = "auto";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "themeOverride" } });
    if (setting) themeOverride = setting.value;
  } catch {}

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: `window.__THEME_OVERRIDE__=${JSON.stringify(themeOverride)};` }} />
      </head>
      <body className="min-h-screen" style={{ background: "var(--cream)" }}>
        <SplashScreen />
        <ThemeProvider override={themeOverride} />
        <RegisterSW />
        {session && <PushSubscriber />}
        <NavBar session={session} />
        <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">{children}</main>
        <BottomNav session={session} />
      </body>
    </html>
  );
}
