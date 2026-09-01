import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks, enrollments, progress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { CompleteButton } from "@/components/actions";
import Navbar from "@/components/Navbar";
import Stars from "@/components/Stars";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return { title: c[0] ? `تعلم · ${c[0].title}` : "التعلم" };
}

function toEmbed(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { slug } = await params;
  const { week: weekParam } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/learn/${slug}`);

  const courseRows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  const course = courseRows[0];
  if (!course) notFound();

  const enr = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
    .limit(1);
  if (enr.length === 0) redirect(`/courses/${course.slug}`);

  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.courseId, course.id))
    .orderBy(asc(weeks.weekNumber));

  if (weekRows.length === 0) notFound();

  const done = await db
    .select({ id: progress.weekId })
    .from(progress)
    .where(eq(progress.userId, user.id));
  const doneSet = new Set(done.map((d) => d.id));

  const requestedWeekNumber = weekParam !== undefined ? Number(weekParam) : null;
  const firstIncompleteIndex = weekRows.findIndex((item) => !doneSet.has(item.id));
  const fallbackIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
  const selectedIndex = Number.isInteger(requestedWeekNumber)
    ? weekRows.findIndex((item) => item.weekNumber === requestedWeekNumber)
    : fallbackIndex;
  const safeIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;
  const week = weekRows[safeIndex];

  // فتح الأسابيع بالتسلسل: الأسبوع متاح إذا كان الأول أو أُنجز الذي قبله
  const unlocked = safeIndex === 0 || doneSet.has(weekRows[safeIndex - 1].id);
  if (!unlocked) {
    const previousWeek = weekRows[safeIndex - 1];
    redirect(`/learn/${course.slug}?week=${previousWeek.weekNumber}`);
  }

  const prev = safeIndex > 0 ? weekRows[safeIndex - 1] : null;
  const next = safeIndex < weekRows.length - 1 ? weekRows[safeIndex + 1] : null;
  const isDone = doneSet.has(week.id);
  const embed = toEmbed(week.videoUrl);
  const paragraphs = week.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />
      <main className="relative px-4 sm:px-8 pt-32 pb-20" style={{ zIndex: 2 }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <Link href={`/courses/${course.slug}`} className="text-sm text-white/65 hover:text-white transition">
              → العودة لصفحة الكورس
            </Link>
            <span className="text-xs font-bold glass rounded-full px-4 py-1.5 text-white/80">
              {course.icon} {course.title}
            </span>
          </div>

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-l from-[#8ad4ff]/20 via-[#b39bff]/20 to-[#ef8fe0]/20 px-6 sm:px-9 py-6 border-b border-white/15">
              <p className="text-xs font-bold text-[#9ae6ff] tracking-widest">
                WEEK {String(week.weekNumber).padStart(2, "0")} · الوحدة {safeIndex + 1} من {weekRows.length}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">{week.title}</h1>
              {week.summary && <p className="text-white/70 text-sm mt-2 leading-7">{week.summary}</p>}
            </div>

            {embed && (
              <div className="aspect-video w-full bg-black/40">
                <iframe
                  src={embed}
                  title={week.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div className="px-6 sm:px-9 py-8 space-y-6">
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => (
                  <p key={i} className="text-white/80 leading-9 text-[15px]">{p}</p>
                ))
              ) : (
                <p className="text-white/60 leading-8 text-sm">
                  ملاحظات المحاضرة التفصيلية ستُضاف قريبًا — تابع الحصة عبر الفيديو وطبّق التمارين.
                </p>
              )}

              <div className="glass rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-white/70">
                  <span className="font-bold text-white">🎯 تمرين الأسبوع:</span> طبّق ما تعلمته في مختبرك الشخصي
                  ووثّق خطواتك في ملف <span dir="ltr" className="font-mono text-[#9ae6ff]">notes.md</span>.
                </div>
                <CompleteButton weekId={week.id} completed={isDone} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-8">
            {prev ? (
              <Link
                href={`/learn/${course.slug}?week=${prev.weekNumber}`}
                className="glass rounded-xl px-6 py-3.5 text-sm font-bold text-white hover:bg-white/[0.14] transition"
              >
                → الأسبوع السابق
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              !isDone ? (
                <span className="rounded-xl px-6 py-3.5 text-sm font-bold text-white/45 bg-white/10 border border-white/10">
                  🔒 أكمل هذا الأسبوع لفتح التالي
                </span>
              ) : (
                <Link
                  href={`/learn/${course.slug}?week=${next.weekNumber}`}
                  className="btn-gradient rounded-xl px-6 py-3.5 text-sm font-extrabold text-[#241542]"
                >
                  الأسبوع التالي ←
                </Link>
              )
            ) : (
              <Link
                href={`/courses/${course.slug}`}
                className="btn-gradient rounded-xl px-6 py-3.5 text-sm font-extrabold text-[#241542]"
              >
                🏁 أنهيت المسار! العودة للكورس
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
