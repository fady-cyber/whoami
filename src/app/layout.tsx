import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Space_Grotesk } from "next/font/google";
import InteractiveBackground from "@/components/InteractiveBackground";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "whoami academy — أكاديمية الأمن السيبراني",
    template: "%s | whoami academy",
  },
  description:
    "أكاديمية whoami لتعليم الأمن السيبراني من الصفر وحتى الاحتراف، بنظام CS50: أسابيع دراسية، محاضرات، وتطبيقات عملية خطوة بخطوة.",
  keywords: ["cybersecurity", "أمن سيبراني", "ethical hacking", "whoami academy", "CS50"],
};

export const viewport: Viewport = {
  themeColor: "#1b1440",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${grotesk.variable}`}>
      <body className="antialiased overflow-x-hidden">
        <InteractiveBackground />
        {children}
      </body>
    </html>
  );
}
