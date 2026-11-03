CREATE TYPE "public"."content_format" AS ENUM('feed', 'story');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('queued', 'processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."quality_status" AS ENUM('draft', 'approved');--> statement-breakpoint
CREATE TABLE "content_generations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"status" "generation_status" NOT NULL,
	"format" "content_format" NOT NULL,
	"request_payload" jsonb NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "content_outputs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_id" uuid NOT NULL,
	"version" numeric NOT NULL,
	"image_path" text,
	"caption_id" text NOT NULL,
	"caption_en" text NOT NULL,
	"hashtags" jsonb NOT NULL,
	"creative_brief" jsonb NOT NULL,
	"quality_status" "quality_status" NOT NULL,
	"is_selected" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
