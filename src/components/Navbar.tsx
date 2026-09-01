"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/#about", label: "من نحن" },
  { href: "/#tracks", label: "المسارات" },
  { href: "/#curriculum", label: "المنهج" },
  { href: "/#contact", label: "تواصل" },
];

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span
        className={`grid place-items-center rounded-xl btn-gradient text-[#241542] font-black ${
          small ? "w-8 h-8 text-sm" : "w-10 h-10 text-lg"
        }`}
      >
        w
      </span>
      <span className="leading-none">
        <span
          dir="ltr"
          className="block font-[var(--font-grotesk)] font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-grotesk)" }}
        >
          whoami
        </span>
        <span className="block text-[11px] tracking-[0.35em] text-white/70 font-medium">
          ACADEMY
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav className="glass mx-3 sm:mx-6 mt-3 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo />

        <ul className="hidden md:flex items-center gap-7 text-sm font-semibold text-white/85">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {ready && user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="glass text-white/90 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/15 transition"
                >
                  الإدارة
                </Link>
              )}
              <Link
                href="/dashboard"
                className="btn-gradient text-[#241542] font-bold text-sm px-5 py-2.5 rounded-xl"
              >
                لوحتي ←
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-gradient text-[#241542] font-bold text-sm px-6 py-2.5 rounded-xl"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="text-white/85 text-sm font-semibold px-3 py-2 nav-link"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="القائمة"
          className="md:hidden glass rounded-lg p-2 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden mx-3 mt-2 glass rounded-2xl p-4 flex flex-col gap-3 text-sm font-semibold">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="py-1.5 px-2 rounded-lg hover:bg-white/10 text-white/90">
              {l.label}
            </a>
          ))}
          <div className="border-t border-white/15 pt-3 flex flex-col gap-3">
            {ready && user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin" className="glass text-white/90 font-bold px-5 py-2.5 rounded-xl text-center hover:bg-white/15 transition">
                    الإدارة
                  </Link>
                )}
                <Link href="/dashboard" className="btn-gradient text-[#241542] font-bold px-5 py-2.5 rounded-xl text-center">
                  لوحتي ←
                </Link>
                <LogoutButton label="خروج" className="glass px-5 py-2.5 rounded-xl text-center text-white/90 hover:bg-white/15 transition" />
              </>
            ) : (
              <>
                <Link href="/login" className="btn-gradient text-[#241542] font-bold px-5 py-2.5 rounded-xl flex-1 text-center">
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="glass px-5 py-2.5 rounded-xl flex-1 text-center text-white/90">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
