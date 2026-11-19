import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "أفا بافلي - خدمة ذوي القدرات الخاصة",
  description: "نظام إدارة خدمة ذوي القدرات الخاصة بالكنيسة",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <NavBar session={session} />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
