import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أفا بافلي - خدمة ذوي القدرات الخاصة",
  description: "نظام إدارة خدمة ذوي القدرات الخاصة بالكنيسة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold">
              ✝ أفا بافلي
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:text-blue-200">
                الرئيسية
              </a>
              <a href="/persons" className="hover:text-blue-200">
                الحالات
              </a>
              <a href="/classes" className="hover:text-blue-200">
                الفصول
              </a>
              <a href="/reports" className="hover:text-blue-200">
                التقارير
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
