import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword, createSessionToken, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "أدخل البريد الإلكتروني وكلمة المرور" }, { status: 400 });
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    await setSessionCookie(await createSessionToken(user));
    return NextResponse.json({ user: publicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع، حاول مجددًا" }, { status: 500 });
  }
}
