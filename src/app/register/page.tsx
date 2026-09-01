import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابك في أكاديمية whoami وابدأ تعلم الأمن السيبراني من الصفر",
};

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
