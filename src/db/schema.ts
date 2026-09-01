import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ============================================================
   whoami academy — Data Model (backend data layer)
   Tables: users, courses, weeks, enrollments, progress, contacts
   ============================================================ */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("student"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    tagline: varchar("tagline", { length: 300 }).notNull().default(""),
    description: text("description").notNull().default(""),
    level: varchar("level", { length: 30 }).notNull().default("مبتدئ"),
    icon: varchar("icon", { length: 10 }).notNull().default("🛡️"),
    color: varchar("color", { length: 40 }).notNull().default("from-sky-400 to-fuchsia-400"),
    duration: varchar("duration", { length: 60 }).notNull().default("10 أسابيع"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("courses_slug_idx").on(t.slug)]
);

export const weeks = pgTable(
  "weeks",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 400 }).notNull().default(""),
    content: text("content").notNull().default(""),
    videoUrl: varchar("video_url", { length: 500 }).notNull().default(""),
    duration: varchar("duration", { length: 40 }).notNull().default("45 دقيقة"),
    isFree: boolean("is_free").notNull().default(true),
  },
  (t) => [
    uniqueIndex("weeks_course_week_idx").on(t.courseId, t.weekNumber),
    index("weeks_course_idx").on(t.courseId),
  ]
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("enrollments_user_course_idx").on(t.userId, t.courseId)]
);

export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekId: integer("week_id")
      .notNull()
      .references(() => weeks.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_user_week_idx").on(t.userId, t.weekId)]
);

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ---------------- Relations ---------------- */

export const coursesRelations = relations(courses, ({ many }) => ({
  weeks: many(weeks),
  enrollments: many(enrollments),
}));

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  course: one(courses, { fields: [weeks.courseId], references: [courses.id] }),
  progress: many(progress),
}));

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  progress: many(progress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, { fields: [progress.userId], references: [users.id] }),
  week: one(weeks, { fields: [progress.weekId], references: [weeks.id] }),
}));

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Week = typeof weeks.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Progress = typeof progress.$inferSelect;
