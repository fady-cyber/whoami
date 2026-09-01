import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments, progress, weeks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { EnrollButton } from "@/components/actions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return { title: row[0]?.title ?? "الكورس", description: row[0]?.tagline ?? "" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const courseRows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  const course = courseRows[0];
  if (!course) notFound();

  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.courseId, course.id))
    .orderBy(asc(weeks.weekNumber));

  let doneSet = new Set<number>();
  let isEnrolled = false;
  if (user) {
    const done = await db
      .select({ id: progress.weekId })
      .from(progress)
      .innerJoin(weeks, eq(progress.weekId, weeks.id))
      .where(and(eq(progress.userId, user.id), eq(weeks.courseId, course.id)));
    doneSet = new Set(done.map((d) => d.id));

    const activeEnrollment = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
      .limit(1);
    isEnrolled = activeEnrollment.length > 0;
  }

  const completed = weekRows.filter((w) => doneSet.has(w.id)).length;
  const percent = weekRows.length ? Math.round((completed / weekRows.length) * 100) : 0;
  const firstWeek = weekRows[0];

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />
      <main className="relative px-4 sm:px-8 pt-36 pb-20" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/courses" className="text-sm text-white/65 hover:text-white transition">
            → كل المسارات
          </Link>

          {/* hero card */}
          <div className="glass-strong rounded-3xl p-8 sm:p-12 mt-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`bg-gradient-to-br ${course.color} text-5xl w-20 h-20 grid place-items-center rounded-3xl shadow-xl`}>
                {course.icon}
              </span>
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-3 py-1 text-white/85">
                    {course.level}
                  </span>
                  <span className="text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-3 py-1 text-white/85">
                    {weekRows.length} أسابيع
                  </span>
                  <span className="text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-3 py-1 text-white/85">
                    ⏱️ {course.duration}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white">{course.title}</h1>
              </div>
            </div>

            <p className="text-white/75 mt-6 leading-8 text-sm sm:text-base">{course.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <EnrollButton
                slug={course.slug}
                enrolled={isEnrolled}
                learnHref={firstWeek ? `/learn/${course.slug}?week=${firstWeek.weekNumber}` : undefined}
              />
              {user && isEnrolled && weekRows.length > 0 && (
                <div className="flex-1 min-w-[180px]">
                  <div className="flex justify-between text-xs text-white/70 font-bold mb-1.5">
                    <span>تقدمك</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-[#8ad4ff] to-[#ef8fe0] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* weeks */}
          <h2 className="text-2xl font-black text-white mt-14 mb-6">منهج الأسابيع</h2>
          <div className="space-y-4">
            {weekRows.map((w, i) => {
              const isDone = doneSet.has(w.id);
              const href = `/learn/${course.slug}?week=${w.weekNumber}`;
              return (
                <Link
                  key={w.id}
                  href={href}
                  className="glass flex items-center gap-5 rounded-2xl p-5 hover:bg-white/[0.14] transition group"
                >
                  <span
                    className={`shrink-0 w-12 h-12 rounded-xl grid place-items-center font-black text-lg ${
                      isDone
                        ? "bg-emerald-400/25 border border-emerald-300/50 text-emerald-100"
                        : "btn-gradient text-[#241542]"
                    }`}
                  >
                    {isDone ? "✓" : String(w.weekNumber).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-white truncate">{w.title}</h3>
                    <p className="text-xs text-white/60 mt-1 line-clamp-1">{w.summary}</p>
                  </div>
                  <span className="hidden sm:block text-xs text-white/55 font-semibold">
                    ⏱️ {w.duration}
                  </span>
                  <span className="text-[#9ae6ff] font-bold text-sm">←</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
