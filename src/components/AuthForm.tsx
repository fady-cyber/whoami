"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

interface AuthFormProps {
  mode: "login" | "register";
}

function Field({
  label,
  type,
  value,
  onChange,
  icon,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon: ReactNode;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white/85">{label}</span>
      <div className="relative mt-1">
        <input
          type={type}
          required
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 pe-11 text-white placeholder:text-white/40 text-sm"
        />
        <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/60">{icon}</span>
      </div>
    </label>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = mode === "login";
  const explicitNextPath = searchParams.get("next");
  const nextPath = explicitNextPath || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin ? { email, password } : { name, email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ ما");
        return;
      }
      const target = explicitNextPath || (data.user?.role === "admin" ? "/admin" : nextPath);
      router.push(target);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مجددًا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-strong relative rounded-3xl p-8 sm:p-10 w-[min(94vw,420px)] fade-up">
      <Link
        href="/"
        aria-label="إغلاق"
        className="absolute -top-3 -left-3 grid place-items-center w-10 h-10 rounded-xl bg-[#171231] text-white border border-white/20 hover:bg-[#2a2154] transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </Link>

      <h1 className="text-center text-3xl font-extrabold text-white mb-8">
        {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <Field
            label="الاسم"
            type="text"
            value={name}
            onChange={setName}
            placeholder="اسمك الكامل"
            autoComplete="name"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            }
          />
        )}

        <Field
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          }
        />

        <Field
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          }
        />

        <div className="flex items-center justify-between text-xs text-white/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-[#b39bff]"
            />
            تذكرني
          </label>
          {isLogin && (
            <Link href="/login" className="hover:text-white transition">
              نسيت كلمة المرور؟
            </Link>
          )}
        </div>

        {error && (
          <p className="text-sm text-[#ffd2d2] bg-[#ff5d7e]/20 border border-[#ff8ba0]/40 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full rounded-xl py-3.5 font-extrabold text-[#241542] text-base disabled:opacity-60"
        >
          {loading ? "لحظات..." : isLogin ? "تسجيل الدخول" : "ابدأ رحلتك الآن"}
        </button>
      </form>

      <p className="text-center text-sm text-white/75 mt-6">
        {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
        <Link
          href={isLogin ? `/register?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`}
          className="font-bold text-[#9ae6ff] hover:text-white transition"
        >
          {isLogin ? "سجّل الآن" : "تسجيل الدخول"}
        </Link>
      </p>
    </div>
  );
}
