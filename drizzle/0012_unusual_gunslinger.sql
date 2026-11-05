CREATE TABLE "report_recommendations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"weekly_report_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"explanation" text NOT NULL,
	"action" text NOT NULL,
	"evidence" jsonb NOT NULL,
	"confidence" text NOT NULL,
	"source" text DEFAULT 'rules' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_recommendations" ADD CONSTRAINT "report_recommendations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_recommendations" ADD CONSTRAINT "report_recommendations_weekly_report_id_weekly_reports_id_fk" FOREIGN KEY ("weekly_report_id") REFERENCES "public"."weekly_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_recommendations_report_type_unique" ON "report_recommendations" USING btree ("weekly_report_id","type");--> statement-breakpoint
CREATE INDEX "report_recommendations_business_created_idx" ON "report_recommendations" USING btree ("business_id","created_at");