CREATE TYPE "public"."report_status" AS ENUM('generating', 'preliminary', 'final', 'stale', 'failed');--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"status" "report_status" NOT NULL,
	"data_through" timestamp with time zone NOT NULL,
	"total_tasks" integer NOT NULL,
	"completed_tasks" integer NOT NULL,
	"snoozed_tasks" integer NOT NULL,
	"skipped_tasks" integer NOT NULL,
	"completion_rate" numeric(5, 2),
	"published_posts" integer NOT NULL,
	"failed_posts" integer NOT NULL,
	"scheduled_posts_next_period" integer NOT NULL,
	"instagram_status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_reports_business_period_unique" ON "weekly_reports" USING btree ("business_id","period_start","period_end","timezone");--> statement-breakpoint
CREATE INDEX "weekly_reports_business_period_idx" ON "weekly_reports" USING btree ("business_id","period_start");