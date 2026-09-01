import { NextResponse } from "next/server";
import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, weeks, enrollments, progress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/courses/:slug — تفاصيل الكورس مع الأسابيع وحالة المستخدم */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const courseRows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  const course = courseRows[0];
  if (!course) {
    return NextResponse.json({ error: "الكورس غير موجود" }, { status: 404 });
  }

  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.courseId, course.id))
    .orderBy(asc(weeks.weekNumber));

  let enrolled = false;
  let completedWeekIds: number[] = [];

  if (user) {
    const enr = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
      .limit(1);
    enrolled = enr.length > 0;

    if (enrolled) {
      const done = await db
        .select({ weekId: progress.weekId })
        .from(progress)
        .innerJoin(weeks, eq(progress.weekId, weeks.id))
        .where(and(eq(progress.userId, user.id), eq(weeks.courseId, course.id)));
      completedWeekIds = done.map((d) => d.weekId);
    }
  }

  const studentsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enrollments)
    .where(eq(enrollments.courseId, course.id));

  return NextResponse.json({
    course: { ...course, studentsCount: studentsCount[0]?.count ?? 0 },
    weeks: weekRows,
    enrolled,
    completedWeekIds,
  });
}
