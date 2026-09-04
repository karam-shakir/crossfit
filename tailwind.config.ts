import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // هوية المطانيخ: نطاق كحلي دافئ يحل محل الرمادي المحايد الافتراضي
        // في كل مكان تُستخدم فيه bg-gray-*/text-gray-*/border-gray-* عبر التطبيق
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#3D4A61",
          700: "#1E2839",
          800: "#131B2E",
          900: "#0B1220",
          950: "#05070D",
        },
        // slate تُستخدم بالتبادل مع gray في عدة ملفات — نفس النطاق لتوحيد المظهر
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#3D4A61",
          700: "#1E2839",
          800: "#131B2E",
          900: "#0B1220",
          950: "#05070D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
