import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks, enrollments, progress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";

export const metadata: Metadata = {
  title: "لوحة الطالب",
  description: "تابع تقدمك في أكاديمية whoami",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const myCourses = await db
    .select({
      courseId: courses.id,
      slug: courses.slug,
      title: courses.title,
      icon: courses.icon,
      color: courses.color,
      level: courses.level,
      duration: courses.duration,
      enrolledAt: enrollments.enrolledAt,
      totalWeeks: sql<number>`count(distinct ${weeks.id})::int`,
      completedWeeks: sql<number>`count(distinct ${progress.id})::int`,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(weeks, eq(weeks.courseId, courses.id))
    .leftJoin(progress, and(eq(progress.userId, user.id), eq(progress.weekId, weeks.id)))
    .where(eq(enrollments.userId, user.id))
    .groupBy(courses.id, enrollments.enrolledAt)
    .orderBy(desc(enrollments.enrolledAt));

  // أول أسبوع غير مكتمل في كل كورس مسجّل (تابع من حيث توقفت)
  const continueLinks: { slug: string; weekNumber: number; title: string }[] = [];
  for (const c of myCourses) {
    const wk = await db
      .select({ id: weeks.id, weekNumber: weeks.weekNumber, title: weeks.title })
      .from(weeks)
      .leftJoin(
        progress,
        and(eq(progress.userId, user.id), eq(progress.weekId, weeks.id))
      )
      .where(and(eq(weeks.courseId, c.courseId), sql`${progress.id} is null`))
      .orderBy(asc(weeks.weekNumber))
      .limit(1);
    if (wk[0]) continueLinks.push({ slug: c.slug, weekNumber: wk[0].weekNumber, title: wk[0].title });
  }

  const totalWeeks = myCourses.reduce((a, c) => a + c.totalWeeks, 0);
  const doneWeeks = myCourses.reduce((a, c) => a + c.completedWeeks, 0);
  const overall = totalWeeks ? Math.round((doneWeeks / totalWeeks) * 100) : 0;

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />
      <main className="relative px-4 sm:px-8 pt-36 pb-20" style={{ zIndex: 2 }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[#9ae6ff] font-bold text-sm tracking-widest">DASHBOARD</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
            أهلًا {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-white/70 mt-3 text-sm">
            هذه لوحة تقدمك في رحلتك داخل عالم الأمن السيبراني.
          </p>

          {/* stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {[
              { v: myCourses.length, l: "كورسات مسجّلة", icon: "🎓" },
              { v: doneWeeks, l: "أسبوع مكتمل", icon: "✅" },
              { v: totalWeeks - doneWeeks, l: "أسابيع متبقية", icon: "📚" },
              { v: `${overall}%`, l: "نسبة الإنجاز", icon: "🚀" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl">{s.icon}</div>
                <div className="text-3xl font-black text-gradient mt-1">{s.v}</div>
                <div className="text-xs text-white/65 mt-1 font-semibold">{s.l}</div>
              </div>
            ))}
          </div>

          {/* continue */}
          {continueLinks.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xl font-black text-white mb-5">▶️ تابع من حيث توقفت</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {continueLinks.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/learn/${l.slug}?week=${l.weekNumber}`}
                    className="glass rounded-2xl p-6 hover:bg-white/[0.14] transition flex items-center gap-4"
                  >
                    <span className="btn-gradient shrink-0 w-12 h-12 rounded-xl grid place-items-center font-black text-[#241542]">
                      {String(l.weekNumber).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-white/60">التالي في المسار</p>
                      <p className="font-bold text-white truncate">{l.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* my courses */}
          <section className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">كورساتي</h2>
              <Link href="/courses" className="text-sm font-bold text-[#9ae6ff] hover:text-white transition">
                + تصفح المزيد
              </Link>
            </div>

            {myCourses.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center">
                <div className="text-5xl mb-4">🧭</div>
                <p className="font-bold text-white text-lg">لم تسجّل في أي كورس بعد</p>
                <p className="text-sm text-white/65 mt-2">ابدأ رحلتك الآن — أول مسار مجاني بالكامل.</p>
                <Link href="/courses" className="btn-gradient inline-block mt-6 rounded-xl px-8 py-3 font-extrabold text-[#241542]">
                  استكشف المسارات
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myCourses.map((c) => {
                  const pct = c.totalWeeks ? Math.round((c.completedWeeks / c.totalWeeks) * 100) : 0;
                  return (
                    <Link key={c.courseId} href={`/courses/${c.slug}`} className="glass rounded-2xl p-5 sm:p-6 block hover:bg-white/[0.14] transition">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`bg-gradient-to-br ${c.color} text-2xl w-12 h-12 grid place-items-center rounded-xl`}>
                          {c.icon}
                        </span>
                        <div className="flex-1 min-w-[200px]">
                          <h3 className="font-extrabold text-white">{c.title}</h3>
                          <p className="text-xs text-white/60 mt-0.5">
                            {c.completedWeeks} من {c.totalWeeks} أسبوع مكتمل · {c.level}
                          </p>
                          <div className="h-2 rounded-full bg-white/15 mt-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-l from-[#8ad4ff] to-[#ef8fe0] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-2xl font-black text-gradient">{pct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
