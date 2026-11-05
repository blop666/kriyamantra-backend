CREATE TYPE "public"."instagram_media_status" AS ENUM('published', 'metric_unavailable');--> statement-breakpoint
CREATE TYPE "public"."metric_availability" AS ENUM('available', 'not_supported', 'permission_missing', 'temporarily_unavailable', 'delayed', 'failed');--> statement-breakpoint
CREATE TABLE "instagram_media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"publish_job_id" uuid,
	"generation_id" uuid,
	"external_media_id" text NOT NULL,
	"permalink" text,
	"media_type" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"status" "instagram_media_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instagram_metric_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"instagram_media_id" uuid NOT NULL,
	"collected_at" timestamp with time zone NOT NULL,
	"window_hours" integer NOT NULL,
	"likes" integer,
	"comments" integer,
	"views" integer,
	"reach" integer,
	"saves" integer,
	"shares" integer,
	"reposts" integer,
	"total_interactions" integer,
	"availability_status" "metric_availability" NOT NULL,
	"source" text DEFAULT 'instagram_insights' NOT NULL,
	"provider_request_id" text,
	"error_code" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "instagram_media" ADD CONSTRAINT "instagram_media_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_media" ADD CONSTRAINT "instagram_media_publish_job_id_instagram_publish_jobs_id_fk" FOREIGN KEY ("publish_job_id") REFERENCES "public"."instagram_publish_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_media" ADD CONSTRAINT "instagram_media_generation_id_content_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."content_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_metric_snapshots" ADD CONSTRAINT "instagram_metric_snapshots_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_metric_snapshots" ADD CONSTRAINT "instagram_metric_snapshots_instagram_media_id_instagram_media_id_fk" FOREIGN KEY ("instagram_media_id") REFERENCES "public"."instagram_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "instagram_media_business_external_unique" ON "instagram_media" USING btree ("business_id","external_media_id");--> statement-breakpoint
CREATE INDEX "instagram_media_business_published_idx" ON "instagram_media" USING btree ("business_id","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "instagram_metric_snapshots_media_window_unique" ON "instagram_metric_snapshots" USING btree ("instagram_media_id","window_hours");--> statement-breakpoint
CREATE INDEX "instagram_metric_snapshots_business_collected_idx" ON "instagram_metric_snapshots" USING btree ("business_id","collected_at");--> statement-breakpoint
CREATE INDEX "instagram_metric_snapshots_media_collected_idx" ON "instagram_metric_snapshots" USING btree ("instagram_media_id","collected_at");