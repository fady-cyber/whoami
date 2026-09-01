import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى أكاديمية whoami واستكمل رحلتك في الأمن السيبراني",
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
