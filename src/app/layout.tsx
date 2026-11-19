import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";

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

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen" style={{ background: "var(--cream)" }}>
        <div
          id="splash"
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
          }}
        >
          <img
            src="/icons/logo-ava-pavly.png"
            alt="أفا بافلي"
            width={120}
            height={120}
            style={{
              objectFit: "contain",
              animation: "splash-pulse 1.5s ease-in-out infinite",
            }}
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
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes splash-pulse {
                  0%, 100% { transform: scale(1); opacity: 0.9; }
                  50% { transform: scale(1.08); opacity: 1; }
                }
              `,
            }}
          />
        </div>
        <NavBar session={session} />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
              window.addEventListener('load', function() {
                var splash = document.getElementById('splash');
                if (splash) {
                  setTimeout(function() {
                    splash.style.opacity = '0';
                    setTimeout(function() { splash.remove(); }, 500);
                  }, 800);
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
