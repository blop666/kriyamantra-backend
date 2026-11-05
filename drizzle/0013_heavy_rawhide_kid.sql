CREATE TYPE "public"."content_plan_item_status" AS ENUM('planned', 'queued', 'draft', 'approved', 'scheduled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."content_plan_status" AS ENUM('planned', 'generating', 'ready', 'partial', 'failed');--> statement-breakpoint
CREATE TABLE "weekly_content_plan_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"product_id" uuid,
	"format" "content_format" NOT NULL,
	"angle" text NOT NULL,
	"scheduled_for" timestamp with time zone,
	"status" "content_plan_item_status" DEFAULT 'planned' NOT NULL,
	"generation_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_content_plans" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"weekly_report_id" uuid NOT NULL,
	"target_posts" integer NOT NULL,
	"status" "content_plan_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_content_plan_items" ADD CONSTRAINT "weekly_content_plan_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_content_plan_items" ADD CONSTRAINT "weekly_content_plan_items_plan_id_weekly_content_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."weekly_content_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_content_plan_items" ADD CONSTRAINT "weekly_content_plan_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_content_plan_items" ADD CONSTRAINT "weekly_content_plan_items_generation_id_content_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."content_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_content_plans" ADD CONSTRAINT "weekly_content_plans_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_content_plans" ADD CONSTRAINT "weekly_content_plans_weekly_report_id_weekly_reports_id_fk" FOREIGN KEY ("weekly_report_id") REFERENCES "public"."weekly_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_content_plan_items_plan_sequence_unique" ON "weekly_content_plan_items" USING btree ("plan_id","sequence");--> statement-breakpoint
CREATE INDEX "weekly_content_plan_items_business_scheduled_idx" ON "weekly_content_plan_items" USING btree ("business_id","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_content_plans_report_unique" ON "weekly_content_plans" USING btree ("weekly_report_id");--> statement-breakpoint
CREATE INDEX "weekly_content_plans_business_created_idx" ON "weekly_content_plans" USING btree ("business_id","created_at");