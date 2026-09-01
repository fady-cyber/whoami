import { NextResponse } from "next/server";
import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks, enrollments, progress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/dashboard — بيانات لوحة الطالب (إحصائيات + كورسات مسجّلة) */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 });
  }

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
    .leftJoin(
      progress,
      and(eq(progress.userId, user.id), eq(progress.weekId, weeks.id))
    )
    .where(eq(enrollments.userId, user.id))
    .groupBy(courses.id, enrollments.enrolledAt)
    .orderBy(desc(enrollments.enrolledAt));

  const stats = await db
    .select({
      enrolled: sql<number>`count(distinct ${enrollments.courseId})::int`,
      completed: sql<number>`count(distinct ${progress.id})::int`,
    })
    .from(enrollments)
    .leftJoin(progress, eq(progress.userId, enrollments.userId))
    .where(eq(enrollments.userId, user.id));

  const totalWeeks = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(weeks)
    .innerJoin(enrollments, eq(enrollments.courseId, weeks.courseId))
    .where(eq(enrollments.userId, user.id));

  return NextResponse.json({
    user: { name: user.name, email: user.email },
    stats: {
      enrolledCourses: stats[0]?.enrolled ?? 0,
      completedWeeks: stats[0]?.completed ?? 0,
      totalWeeks: totalWeeks[0]?.count ?? 0,
    },
    courses: myCourses,
  });
}
