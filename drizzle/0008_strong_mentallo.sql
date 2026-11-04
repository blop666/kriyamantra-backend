CREATE TYPE "public"."schedule_status" AS ENUM('scheduled', 'cancelled', 'published', 'failed');--> statement-breakpoint
CREATE TABLE "instagram_schedules" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"generation_id" uuid NOT NULL,
	"media_type" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "schedule_status" NOT NULL,
	"caption" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"cancelled_at" timestamp with time zone,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "instagram_schedules_business_idempotency_unique" ON "instagram_schedules" USING btree ("business_id","idempotency_key");