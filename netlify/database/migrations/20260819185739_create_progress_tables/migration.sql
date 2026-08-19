CREATE TABLE "lesson_progress" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"course_slug" text NOT NULL,
	"lesson_id" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"best_accuracy" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "lesson_progress_user_id_course_slug_lesson_id_unique" UNIQUE("user_id","course_slug","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"course_slug" text NOT NULL,
	"item_id" text NOT NULL,
	"ease_factor" real DEFAULT 2.3 NOT NULL,
	"interval_days" real DEFAULT 1 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"last_result" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "review_items_user_id_course_slug_item_id_unique" UNIQUE("user_id","course_slug","item_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" text PRIMARY KEY,
	"xp" integer DEFAULT 0 NOT NULL,
	"gems" integer DEFAULT 20 NOT NULL,
	"hearts" integer DEFAULT 5 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"updated_at" timestamp DEFAULT now()
);
