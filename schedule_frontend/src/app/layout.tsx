import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Đăng nhập | Cổng Quản Lý Nhân Sự Ăn Vặt BLOAN",
  description:
    "Hệ thống quản lý ca làm, chấm công và nhân sự dành riêng cho chuỗi cửa hàng Ăn Vặt BLOAN.",
  icons: {
    icon: "/logo/logo2.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#FBFBFC] text-slate-800 flex flex-col selection:bg-amber-200 selection:text-amber-900">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
