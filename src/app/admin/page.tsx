import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Stars from "@/components/Stars";
import { getAdminOverview } from "@/lib/admin";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  description: "إدارة منصة whoami academy ومتابعة الإحصائيات والرسائل",
};

export const dynamic = "force-dynamic";

function fmt(date: Date | string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin(user)) redirect("/dashboard");

  const overview = await getAdminOverview();

  const statCards = [
    { label: "إجمالي المستخدمين", value: overview.stats.usersCount, icon: "👥" },
    { label: "الطلاب", value: overview.stats.studentsCount, icon: "🎓" },
    { label: "الكورسات", value: overview.stats.coursesCount, icon: "🧭" },
    { label: "الأسابيع", value: overview.stats.weeksCount, icon: "📚" },
    { label: "التسجيلات", value: overview.stats.enrollmentsCount, icon: "📝" },
    { label: "الإنجازات", value: overview.stats.progressCount, icon: "✅" },
    { label: "رسائل التواصل", value: overview.stats.contactsCount, icon: "📩" },
  ];

  return (
    <div className="sky-page relative">
      <Stars />
      <Navbar />
      <main className="relative px-4 sm:px-8 pt-36 pb-20" style={{ zIndex: 2 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[#9ae6ff] font-bold text-sm tracking-widest">ADMIN PANEL</p>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">لوحة إدارة whoami academy</h1>
              <p className="text-white/70 mt-3 text-sm leading-7">
                أهلًا <span className="text-white font-bold">{user.name}</span> — هذه نظرة شاملة على المنصة، المستخدمين، والتفاعل الحالي.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard" className="glass rounded-xl px-5 py-3 text-sm font-bold text-white hover:bg-white/15 transition">
                لوحة الطالب
              </Link>
              <Link href="/courses" className="btn-gradient rounded-xl px-5 py-3 text-sm font-extrabold text-[#241542]">
                عرض الكورسات
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {statCards.map((item) => (
              <div key={item.label} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl">{item.icon}</div>
                <div className="text-3xl font-black text-gradient mt-1">{item.value}</div>
                <div className="text-xs text-white/65 mt-1 font-semibold">{item.label}</div>
              </div>
            ))}
          </section>

          <section className="grid xl:grid-cols-3 gap-6 mt-12">
            <div className="glass rounded-3xl p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-white">آخر رسائل التواصل</h2>
                <span className="text-xs text-white/55">آخر {overview.latestContacts.length} رسالة</span>
              </div>
              <div className="space-y-4">
                {overview.latestContacts.length === 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-sm text-white/60">
                    لا توجد رسائل حتى الآن.
                  </div>
                ) : (
                  overview.latestContacts.map((msg) => (
                    <div key={msg.id} className="rounded-2xl bg-white/7 border border-white/12 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-white">{msg.name}</p>
                          <p dir="ltr" className="text-xs text-[#9ae6ff] mt-0.5">{msg.email}</p>
                        </div>
                        <span className="text-[11px] text-white/45">{fmt(msg.createdAt)}</span>
                      </div>
                      <p className="text-sm text-white/75 leading-7 mt-3 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-white">أحدث الحسابات</h2>
                <span className="text-xs text-white/55">{overview.latestUsers.length} مستخدم</span>
              </div>
              <div className="space-y-3">
                {overview.latestUsers.map((member) => (
                  <div key={member.id} className="rounded-2xl bg-white/7 border border-white/12 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{member.name}</p>
                        <p dir="ltr" className="text-xs text-white/60 truncate mt-1">{member.email}</p>
                      </div>
                      <span className={`text-[11px] font-bold rounded-full px-3 py-1 border ${member.role === "admin" ? "bg-amber-300/15 text-amber-100 border-amber-200/30" : "bg-white/10 text-white/75 border-white/15"}`}>
                        {member.role === "admin" ? "admin" : "student"}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/45 mt-3">{fmt(member.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass rounded-3xl p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">أفضل الطلاب إنجازًا</h2>
              <span className="text-xs text-white/55">Leaderboard</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/55 border-b border-white/10">
                    <th className="text-right py-3 px-2">الترتيب</th>
                    <th className="text-right py-3 px-2">الطالب</th>
                    <th className="text-right py-3 px-2">البريد</th>
                    <th className="text-right py-3 px-2">أسابيع مكتملة</th>
                    <th className="text-right py-3 px-2">كورسات مسجّلة</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topStudents.map((student, idx) => (
                    <tr key={student.id} className="border-b border-white/8 last:border-b-0">
                      <td className="py-3 px-2 font-black text-gradient">#{idx + 1}</td>
                      <td className="py-3 px-2 font-bold text-white">{student.name}</td>
                      <td dir="ltr" className="py-3 px-2 text-white/65">{student.email}</td>
                      <td className="py-3 px-2 text-white/80">{student.completedWeeks}</td>
                      <td className="py-3 px-2 text-white/80">{student.enrolledCourses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
