import type { Metadata } from "next";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks } from "@/db/schema";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Stars from "@/components/Stars";

export const metadata: Metadata = {
  title: "المسارات",
  description: "كل مسارات أكاديمية whoami لتعلم الأمن السيبراني",
};

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const rows = await db
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
      weeksCount: sql<number>`count(${weeks.id})::int`,
    })
    .from(courses)
    .leftJoin(weeks, eq(weeks.courseId, courses.id))
    .groupBy(courses.id)
    .orderBy(courses.sortOrder);

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />
      <main className="relative px-4 sm:px-8 pt-36 pb-20" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#9ae6ff] font-bold text-sm tracking-widest mb-2">OUR TRACKS</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white">كل مسارات الأكاديمية</h1>
            <p className="text-white/70 mt-4 max-w-xl mx-auto text-sm leading-7">
              ستة مسارات متكاملة من المبتدئ حتى المحترف — سجّل في أي مسار مجانًا وابدأ فورًا.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((c) => (
              <Link key={c.id} href={`/courses/${c.slug}`} className="glass rounded-3xl p-7 hover:bg-white/[0.14] transition hover:-translate-y-1.5">
                <div className="flex items-start justify-between">
                  <span className={`bg-gradient-to-br ${c.color} text-3xl w-14 h-14 grid place-items-center rounded-2xl shadow-lg`}>
                    {c.icon}
                  </span>
                  <span className="text-[11px] font-bold bg-white/15 border border-white/25 rounded-full px-3 py-1 text-white/85">
                    {c.level}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-5">{c.title}</h2>
                <p className="text-sm text-white/65 mt-2 leading-7 line-clamp-3">{c.description}</p>
                <div className="flex items-center gap-4 mt-5 text-xs text-white/60 font-semibold">
                  <span>📚 {c.weeksCount} أسابيع</span>
                  <span>⏱️ {c.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
