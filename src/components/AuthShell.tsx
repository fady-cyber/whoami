import { Suspense } from "react";
import Navbar from "./Navbar";
import Stars from "./Stars";
import AuthForm from "./AuthForm";

export default function AuthShell({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="sky-page relative flex flex-col">
      <Stars />
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-4 py-32" style={{ zIndex: 2 }}>
        <Suspense fallback={<div className="glass-strong rounded-3xl p-10 text-white/70">جاري التحميل...</div>}>
          <AuthForm mode={mode} />
        </Suspense>
      </main>

      {/* silhouette: شخصية تتأمل السماء كما في التصميم */}
      <svg
        aria-hidden
        viewBox="0 0 1440 240"
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 240 L0 200 Q 260 168 480 196 T 920 192 T 1440 196 L1440 240 Z"
          fill="rgba(16,10,38,0.55)"
        />
        <g transform="translate(690 84)" fill="rgba(16,10,38,0.72)">
          <path d="M0 60 Q -2 34 12 24 Q 10 0 30 0 Q 50 0 48 24 Q 62 34 60 60 Z" />
          <path d="M12 34 Q 4 60 10 156 L 50 156 Q 56 60 48 34 Z" />
          <path d="M14 50 Q 0 76 8 96 L 22 92 Z" />
          <path d="M46 50 Q 60 76 52 96 L 38 92 Z" />
        </g>
      </svg>

      <p className="absolute bottom-4 inset-x-0 text-center text-[11px] text-white/40 z-10">
        whoami — #{process.env.NODE_ENV === "production" ? "prod" : "dev"} · Secure by default
      </p>
    </div>
  );
}
