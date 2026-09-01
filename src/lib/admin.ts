import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contacts, courses, enrollments, progress, users, weeks } from "@/db/schema";

export async function getAdminOverview() {
  const [stats] = await db
    .select({
      usersCount: sql<number>`(select count(*)::int from ${users})`,
      studentsCount: sql<number>`(select count(*)::int from ${users} where ${users.role} = 'student')`,
      coursesCount: sql<number>`(select count(*)::int from ${courses})`,
      weeksCount: sql<number>`(select count(*)::int from ${weeks})`,
      enrollmentsCount: sql<number>`(select count(*)::int from ${enrollments})`,
      progressCount: sql<number>`(select count(*)::int from ${progress})`,
      contactsCount: sql<number>`(select count(*)::int from ${contacts})`,
    })
    .from(users)
    .limit(1);

  const latestContacts = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      message: contacts.message,
      createdAt: contacts.createdAt,
    })
    .from(contacts)
    .orderBy(desc(contacts.createdAt))
    .limit(8);

  const latestUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(8);

  const topStudents = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      completedWeeks: sql<number>`count(distinct ${progress.id})::int`,
      enrolledCourses: sql<number>`count(distinct ${enrollments.courseId})::int`,
    })
    .from(users)
    .leftJoin(progress, eq(progress.userId, users.id))
    .leftJoin(enrollments, eq(enrollments.userId, users.id))
    .where(eq(users.role, "student"))
    .groupBy(users.id)
    .orderBy(sql`count(distinct ${progress.id}) desc`, sql`count(distinct ${enrollments.courseId}) desc`, users.createdAt);

  return {
    stats,
    latestContacts,
    latestUsers,
    topStudents: topStudents.slice(0, 10),
  };
}
