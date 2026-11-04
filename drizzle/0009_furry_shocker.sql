ALTER TYPE "public"."schedule_status" ADD VALUE 'processing' BEFORE 'cancelled';--> statement-breakpoint
ALTER TABLE "instagram_schedules" ADD CONSTRAINT "instagram_schedules_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_schedules" ADD CONSTRAINT "instagram_schedules_generation_id_content_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."content_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "instagram_schedules_business_created_idx" ON "instagram_schedules" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "instagram_schedules_due_idx" ON "instagram_schedules" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "instagram_schedules_generation_idx" ON "instagram_schedules" USING btree ("generation_id");