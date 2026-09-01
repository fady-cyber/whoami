"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || "حدث خطأ");
        setState("error");
        return;
      }
      setState("done");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🚀</div>
        <p className="font-bold text-white">وصلتنا رسالتك!</p>
        <p className="text-sm text-white/70 mt-1">سنرد عليك خلال 24 ساعة بإذن الله.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="اسمك"
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="بريدك الإلكتروني"
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={5}
        placeholder="اكتب رسالتك أو سؤالك هنا..."
        className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 resize-none"
      />
      {err && <p className="text-sm text-rose-200">{err}</p>}
      <button
        disabled={state === "loading"}
        className="btn-gradient w-full rounded-xl py-3.5 font-extrabold text-[#241542] disabled:opacity-60"
      >
        {state === "loading" ? "جاري الإرسال..." : "إرسال الرسالة"}
      </button>
    </form>
  );
}
