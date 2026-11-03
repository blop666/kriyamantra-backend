DO $$ BEGIN
  CREATE TYPE "public"."integration_status" AS ENUM('active', 'expired', 'revoked', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."publish_status" AS ENUM('processing', 'succeeded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "instagram_handle" text;
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "contact_phone" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instagram_connections" (
  "id" uuid PRIMARY KEY NOT NULL,
  "business_id" uuid NOT NULL,
  "instagram_user_id" text NOT NULL,
  "username" text NOT NULL,
  "account_type" text NOT NULL,
  "access_token_encrypted" text NOT NULL,
  "token_expires_at" timestamp with time zone,
  "scopes" text[] NOT NULL,
  "status" "integration_status" NOT NULL,
  "connected_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instagram_oauth_states" (
  "id" uuid PRIMARY KEY NOT NULL,
  "business_id" uuid NOT NULL,
  "state_hash" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "consumed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instagram_publish_jobs" (
  "id" uuid PRIMARY KEY NOT NULL,
  "business_id" uuid NOT NULL,
  "connection_id" uuid NOT NULL,
  "generation_id" uuid NOT NULL,
  "media_type" text NOT NULL,
  "caption" text NOT NULL,
  "container_id" text,
  "provider_media_id" text,
  "status" "publish_status" NOT NULL,
  "provider_error" text,
  "confirmed_at" timestamp with time zone NOT NULL,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL
);
