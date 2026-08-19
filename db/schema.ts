import { pgTable, serial, text, integer, real, timestamp, date, unique } from "drizzle-orm/pg-core";

export const userStats = pgTable("user_stats", {
  userId: text("user_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  gems: integer("gems").notNull().default(20),
  hearts: integer("hearts").notNull().default(5),
  streak: integer("streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  courseSlug: text("course_slug").notNull(),
  lessonId: text("lesson_id").notNull(),
  status: text("status").notNull().default("in_progress"),
  bestAccuracy: integer("best_accuracy").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  completedAt: timestamp("completed_at"),
}, (t) => [unique().on(t.userId, t.courseSlug, t.lessonId)]);

export const reviewItems = pgTable("review_items", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  courseSlug: text("course_slug").notNull(),
  itemId: text("item_id").notNull(),
  easeFactor: real("ease_factor").notNull().default(2.3),
  intervalDays: real("interval_days").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  lastResult: text("last_result"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [unique().on(t.userId, t.courseSlug, t.itemId)]);
