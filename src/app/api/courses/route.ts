import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";

/** GET /api/courses — قائمة الكورسات مع عدد الأسابيع والطلاب */
export async function GET() {
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
      isFeatured: courses.isFeatured,
      weeksCount: sql<number>`count(weeks.id)::int`,
    })
    .from(courses)
    .leftJoin(
      sql`weeks`,
      sql`weeks.course_id = ${courses.id}`
    )
    .groupBy(courses.id)
    .orderBy(courses.sortOrder);

  return NextResponse.json({ courses: rows });
}
