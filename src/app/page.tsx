import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks } from "@/db/schema";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";
import ContactForm from "@/components/ContactForm";

const FEATURES = [
  { icon: "🗺️", title: "منهج بنظام CS50", desc: "أسابيع دراسية مرتبة من الصفر حتى الاحتراف، كل أسبوع بدرس نظري وتطبيق عملي." },
  { icon: "🧪", title: "تطبيق عملي 100%", desc: "مختبرات، تمارين، وتحديات (Problem Sets) على كل أسبوع داخل بيئات آمنة." },
  { icon: "🛡️", title: "مرونة كاملة", desc: "تعلّم بوتيرتك، أعد أي محاضرة، وتابع تقدمك خطوة بخطوة من لوحة الطالب." },
  { icon: "🎯", title: "مسار واضح", desc: "من إدارة الحسابات والتشفير حتى اختبار الاختراق والتحقيق الجنائي الرقمي." },
  { icon: "👩‍💻", title: "مجتمع متعاون", desc: "قناة ديسكورد، مراجعات أسبوعية، وربط مباشر مع المدربين." },
  { icon: "🏆", title: "شهادة إتمام", desc: "احصل على شهادة عند إتمام كل مسار مع مشروع تخرج حقيقي." },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courseRows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      tagline: courses.tagline,
      description: courses.description,
      level: courses.level,
      icon: courses.icon,
      color: courses.color,
      duration: courses.duration,
      isFeatured: courses.isFeatured,
      weeksCount: sql<number>`count(${weeks.id})::int`,
    })
    .from(courses)
    .leftJoin(weeks, eq(weeks.courseId, courses.id))
    .groupBy(courses.id)
    .orderBy(courses.sortOrder);

  const featured = courseRows.find((c) => c.isFeatured) ?? courseRows[0];
  const roadmap = featured
    ? await db
        .select()
        .from(weeks)
        .where(eq(weeks.courseId, featured.id!))
        .orderBy(asc(weeks.weekNumber))
    : [];

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />

      <main className="relative" style={{ zIndex: 2 }}>
        {/* ================= HERO ================= */}
        <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-28 pb-16">
          <span className="glass rounded-full px-5 py-2 text-xs font-bold text-white/85 mb-6 fade-up">
            🎓 منهج أكاديمي بنظام CS50 · تدريس من الصفر حتى الاحتراف
          </span>

          <h1
            className="text-5xl sm:text-7xl font-black leading-[1.15] fade-up"
            style={{ animationDelay: "0.12s" }}
          >
            <span dir="ltr" className="text-gradient" style={{ fontFamily: "var(--font-grotesk)" }}>
              whoami academy
            </span>
            <br />
            <span className="text-white drop-shadow-[0_0_30px_rgba(255,200,240,0.45)]">
              تعلّم الأمن السيبراني
            </span>
          </h1>

          <p
            className="mt-6 max-w-2xl text-white/80 text-lg leading-9 fade-up"
            style={{ animationDelay: "0.24s" }}
          >
            من أول سطر في التيرمينال حتى أول ثغرة تجدها بنفسك — مسارات عملية مقسّمة
            لأسابيع، بمحاضرات وتمارين وتحديات حقيقية، تمامًا مثل CS50 لكن في عالم
            السايبر سيكورتي.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-4 fade-up"
            style={{ animationDelay: "0.36s" }}
          >
            <Link href="/register" className="btn-gradient rounded-xl px-9 py-4 font-extrabold text-[#241542]">
              ابدأ رحلتك مجانًا ←
            </Link>
            <a href="#tracks" className="glass rounded-xl px-9 py-4 font-bold text-white hover:bg-white/15 transition">
              استكشف المسارات
            </a>
          </div>

          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl fade-up"
            style={{ animationDelay: "0.48s" }}
          >
            {[
              { v: `${courseRows.length}+`, l: "مسارات متخصصة" },
              { v: `${roadmap.length}`, l: "أسابيع في المسار الرئيسي" },
              { v: "100%", l: "تطبيق عملي" },
              { v: "24/7", l: "وصول مدى الحياة" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl py-5 px-3">
                <div className="text-2xl font-black text-gradient">{s.v}</div>
                <div className="text-xs text-white/70 mt-1 font-semibold">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= TRACKS ================= */}
        <section id="tracks" className="px-4 sm:px-8 py-20 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#9ae6ff] font-bold text-sm tracking-widest mb-2">SERVICES · المسارات</p>
              <h2 className="text-3xl sm:text-5xl font-black text-white">اختر مسارك في عالم الأمن</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courseRows.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="glass rounded-3xl p-7 group hover:bg-white/[0.14] transition duration-300 hover:-translate-y-1.5"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="flex items-start justify-between">
                    <span className={`bg-gradient-to-br ${c.color} text-3xl w-14 h-14 grid place-items-center rounded-2xl shadow-lg`}>
                      {c.icon}
                    </span>
                    <span className="text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-3 py-1 text-white/85">
                      {c.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-5 group-hover:text-gradient transition">
                    {c.title}
                  </h3>
                  <p className="text-sm text-white/65 mt-2 leading-7 line-clamp-3">{c.tagline || c.description}</p>
                  <div className="flex items-center gap-3 mt-5 text-xs text-white/60 font-semibold">
                    <span>📚 {c.weeksCount} أسابيع</span>
                    <span>⏱️ {c.duration}</span>
                  </div>
                  <span className="inline-block mt-4 text-sm font-bold text-[#9ae6ff] group-hover:translate-x-[-4px] transition-transform">
                    ادخل للمسار ←
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CURRICULUM (CS50 style) ================= */}
        {featured && (
          <section id="curriculum" className="px-4 sm:px-8 py-20 scroll-mt-24">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-[#ffc7e8] font-bold text-sm tracking-widest mb-2">CURRICULUM · المنهج</p>
                <h2 className="text-3xl sm:text-5xl font-black text-white">
                  رحلتك أسبوعًا بأسبوع — مثل CS50
                </h2>
                <p className="text-white/70 mt-4 max-w-xl mx-auto text-sm leading-7">
                  المسار الرئيسي <span className="font-bold text-white">{featured.title}</span> مقسّم إلى
                  أسابيع متراكمة: كل أسبوع يبني على ما قبله بمحاضرة وتمرين واختبار.
                </p>
              </div>

              <div className="relative">
                <span className="absolute right-[26px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#8ad4ff] via-[#b39bff] to-[#ef8fe0] rounded-full opacity-70" />
                <div className="space-y-5">
                  {roadmap.map((w) => (
                    <Link
                      key={w.id}
                      href={`/learn/${featured.slug}?week=${w.weekNumber}`}
                      className="glass relative flex items-center gap-5 rounded-2xl p-5 ps-3 hover:bg-white/[0.14] transition group"
                    >
                      <span className="relative z-10 shrink-0 w-14 h-14 rounded-2xl btn-gradient text-[#241542] font-black text-lg grid place-items-center shadow-lg">
                        {String(w.weekNumber).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-white group-hover:text-gradient transition truncate">
                          {w.title}
                        </h3>
                        <p className="text-xs text-white/60 mt-1 line-clamp-1">{w.summary}</p>
                      </div>
                      <span className="hidden sm:block text-xs text-white/55 font-semibold shrink-0">
                        ⏱️ {w.duration}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="glass rounded-2xl mt-6 p-5 flex items-center justify-between gap-4">
                  <p className="text-sm text-white/75 font-semibold">
                    🏁 <span className="text-white">الأسبوع الأخير:</span> مشروع التخرج — ثغرة من اختيارك، تحليل كامل وتقرير احترافي.
                  </p>
                  <Link
                    href={`/courses/${featured.slug}`}
                    className="btn-gradient shrink-0 rounded-xl px-5 py-2.5 text-[#241542] font-extrabold text-sm"
                  >
                    التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= ABOUT / WHY ================= */}
        <section id="about" className="px-4 sm:px-8 py-20 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#c9b8ff] font-bold text-sm tracking-widest mb-2">ABOUT · من نحن</p>
              <h2 className="text-3xl sm:text-5xl font-black text-white">لماذا whoami academy؟</h2>
              <p className="text-white/70 mt-4 max-w-xl mx-auto text-sm leading-7">
                «whoami» هو أول أمر يكتبه كل هاكر في التيرمينال — من يسأل: من أنا؟
                هنا تعرف إجابتك في عالم الأمن السيبراني.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="glass rounded-3xl p-7 hover:bg-white/[0.14] transition">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="font-extrabold text-white mt-4">{f.title}</h3>
                  <p className="text-sm text-white/65 mt-2 leading-7">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA banner */}
            <div className="glass-strong rounded-3xl mt-14 p-10 text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#b39bff]/30 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#ef8fe0]/25 blur-3xl" />
              <h3 className="text-2xl sm:text-4xl font-black text-white relative">
                جاهز تعرف <span dir="ltr" className="text-gradient" style={{ fontFamily: "var(--font-grotesk)" }}>whoami</span>؟
              </h3>
              <p className="text-white/75 mt-4 max-w-lg mx-auto text-sm leading-7 relative">
                أنشئ حسابك الآن مجانًا وابدأ الأسبوع الأول اليوم — لا تحتاج أي خبرة سابقة،
                فقط فضول وشغف.
              </p>
              <Link
                href="/register"
                className="btn-gradient inline-block mt-7 rounded-xl px-10 py-4 font-extrabold text-[#241542] relative"
              >
                أنشئ حسابك مجانًا
              </Link>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="px-4 sm:px-8 py-20 scroll-mt-24">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[#9ae6ff] font-bold text-sm tracking-widest mb-2">CONTACT · تواصل</p>
              <h2 className="text-3xl sm:text-5xl font-black text-white">عندك سؤال؟ كلمنا</h2>
            </div>
            <div className="glass rounded-3xl p-7 sm:p-9">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
