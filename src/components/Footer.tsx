import Link from "next/link";
import { Logo } from "./Navbar";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-10">
      <div className="glass mx-3 sm:mx-6 mb-6 rounded-3xl px-6 sm:px-10 py-10 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-4">
          <Logo />
          <p className="text-white/70 text-sm leading-7 max-w-md">
            أكاديمية whoami — رحلتك لاحتراف الأمن السيبراني تبدأ من هنا. منهج عملي بنظام
            CS50 من الصفر، بلا حشو، وبتطبيق حقيقي على كل أسبوع.
          </p>
          <div className="flex gap-3" dir="ltr">
            {["GitHub", "X", "YouTube", "Discord"].map((s) => (
              <span key={s} className="glass rounded-xl px-4 py-2 text-xs font-bold text-white/80 hover:text-white transition">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li><Link href="/#about" className="hover:text-white transition">من نحن</Link></li>
            <li><Link href="/#tracks" className="hover:text-white transition">المسارات</Link></li>
            <li><Link href="/#curriculum" className="hover:text-white transition">المنهج</Link></li>
            <li><Link href="/#contact" className="hover:text-white transition">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">الأكاديمية</h4>
          <ul className="space-y-2.5 text-sm text-white/65">
            <li><Link href="/courses" className="hover:text-white transition">كل المسارات</Link></li>
            <li><Link href="/register" className="hover:text-white transition">إنشاء حساب</Link></li>
            <li><Link href="/login" className="hover:text-white transition">تسجيل الدخول</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition">لوحة الطالب</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-white/45 pb-6">
        © {new Date().getFullYear()} whoami academy — صُنع بحب في عالم السايبر 🛡️
      </p>
    </footer>
  );
}
