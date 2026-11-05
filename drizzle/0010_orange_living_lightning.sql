CREATE TYPE "public"."task_set_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done', 'snoozed', 'skipped');--> statement-breakpoint
CREATE TABLE "task_actions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"from_status" "task_status" NOT NULL,
	"to_status" "task_status" NOT NULL,
	"actor_user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_task_sets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"status" "task_set_status" DEFAULT 'active' NOT NULL,
	"generation_key" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"task_set_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" integer NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"due_at" timestamp with time zone,
	"product_id" uuid,
	"content_generation_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "timezone" text DEFAULT 'Asia/Makassar' NOT NULL;--> statement-breakpoint
ALTER TABLE "task_actions" ADD CONSTRAINT "task_actions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_actions" ADD CONSTRAINT "task_actions_task_id_weekly_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."weekly_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_task_sets" ADD CONSTRAINT "weekly_task_sets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_tasks" ADD CONSTRAINT "weekly_tasks_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_tasks" ADD CONSTRAINT "weekly_tasks_task_set_id_weekly_task_sets_id_fk" FOREIGN KEY ("task_set_id") REFERENCES "public"."weekly_task_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_tasks" ADD CONSTRAINT "weekly_tasks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_tasks" ADD CONSTRAINT "weekly_tasks_content_generation_id_content_generations_id_fk" FOREIGN KEY ("content_generation_id") REFERENCES "public"."content_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_actions_business_created_idx" ON "task_actions" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "task_actions_task_created_idx" ON "task_actions" USING btree ("task_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_task_sets_business_period_unique" ON "weekly_task_sets" USING btree ("business_id","period_start","period_end","timezone");--> statement-breakpoint
CREATE INDEX "weekly_task_sets_business_created_idx" ON "weekly_task_sets" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "weekly_tasks_business_created_idx" ON "weekly_tasks" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "weekly_tasks_task_set_idx" ON "weekly_tasks" USING btree ("task_set_id");--> statement-breakpoint
CREATE INDEX "weekly_tasks_business_status_idx" ON "weekly_tasks" USING btree ("business_id","status");