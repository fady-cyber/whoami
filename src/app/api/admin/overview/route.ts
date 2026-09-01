import { NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/admin";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/** GET /api/admin/overview — إحصائيات المشرف */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const overview = await getAdminOverview();

  return NextResponse.json({
    admin: { id: user.id, name: user.name, email: user.email },
    ...overview,
  });
}
