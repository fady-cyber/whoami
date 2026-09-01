"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnrollButton({
  slug,
  enrolled = false,
  learnHref,
}: {
  slug: string;
  enrolled?: boolean;
  learnHref?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(enrolled);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${slug}/enroll`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?next=/courses/${slug}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-400/15 border border-emerald-300/40 text-emerald-100 rounded-xl px-5 py-3 font-bold text-sm">
          ✓ أنت مسجّل بالفعل في هذا الكورس
        </div>
        {learnHref && (
          <Link
            href={learnHref}
            className="glass rounded-xl px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
          >
            ابدأ التعلّم ←
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={enroll}
        disabled={loading}
        className="btn-gradient rounded-xl px-8 py-3.5 font-extrabold text-[#241542] disabled:opacity-60"
      >
        {loading ? "جاري التسجيل..." : "🎓 سجّل في الكورس مجانًا"}
      </button>
      {error && <p className="text-sm text-rose-200">{error}</p>}
    </div>
  );
}

export function CompleteButton({
  weekId,
  completed,
}: {
  weekId: number;
  completed: boolean;
}) {
  const [done, setDone] = useState(completed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setDone(data.completed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-6 py-3 font-bold text-sm transition disabled:opacity-60 ${
        done
          ? "bg-emerald-400/20 border border-emerald-300/50 text-emerald-100"
          : "btn-gradient text-[#241542]"
      }`}
    >
      {loading ? "..." : done ? "✓ أُنجز هذا الأسبوع" : "إتمام الأسبوع"}
    </button>
  );
}
