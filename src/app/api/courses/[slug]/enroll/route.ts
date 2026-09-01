import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { enrollments, courses } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/** POST /api/courses/:slug/enroll — تسجيل المستخدم في كورس */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 });
  }

  const { slug } = await params;
  const courseRows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  const course = courseRows[0];
  if (!course) {
    return NextResponse.json({ error: "الكورس غير موجود" }, { status: 404 });
  }

  await db
    .insert(enrollments)
    .values({ userId: user.id, courseId: course.id })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, courseId: course.id });
}
