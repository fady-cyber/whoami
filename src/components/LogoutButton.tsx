"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({
  className = "glass rounded-xl px-4 py-2 text-sm font-bold text-white/90 hover:bg-white/15 transition",
  label = "تسجيل الخروج",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={logout} disabled={loading} className={className}>
      {loading ? "..." : label}
    </button>
  );
}
