import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مجموعة المطانيخ — CrossFit",
  description: "منصة تدريب CrossFit لمجموعة المطانيخ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
