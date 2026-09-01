import { NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/contact — استقبال رسائل التواصل */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const message = String(body?.message || "").trim();

    if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 5) {
      return NextResponse.json({ error: "تأكد من صحة البيانات المدخلة" }, { status: 400 });
    }

    await db.insert(contacts).values({ name, email, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact error:", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
