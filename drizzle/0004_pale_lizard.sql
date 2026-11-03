CREATE TYPE "public"."image_job_status" AS ENUM('queued', 'processing', 'succeeded', 'failed');--> statement-breakpoint
ALTER TABLE "content_generations" ADD COLUMN "image_status" "image_job_status";--> statement-breakpoint
ALTER TABLE "content_generations" ADD COLUMN "image_job_id" text;--> statement-breakpoint
ALTER TABLE "content_generations" ADD COLUMN "image_error" text;