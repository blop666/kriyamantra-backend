CREATE TYPE "public"."conversation_channel" AS ENUM('web', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."conversation_state" AS ENUM('collect_context', 'ask_missing_data', 'confirm_generation', 'generating', 'review_output', 'revision', 'approved');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"channel" "conversation_channel" NOT NULL,
	"state" "conversation_state" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
