import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

/** POST /api/progress — تبديل حالة إتمام أسبوع { weekId } */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولًا" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const weekId = Number(body?.weekId);
  if (!Number.isInteger(weekId) || weekId <= 0) {
    return NextResponse.json({ error: "weekId غير صالح" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.weekId, weekId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.weekId, weekId)));
    return NextResponse.json({ completed: false });
  }

  await db.insert(progress).values({ userId: user.id, weekId });
  return NextResponse.json({ completed: true });
}
