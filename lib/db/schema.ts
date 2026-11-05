import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const conversationChannel = pgEnum("conversation_channel", ["web", "whatsapp"]);
export const conversationState = pgEnum("conversation_state", ["collect_context", "ask_missing_data", "confirm_generation", "generating", "review_output", "revision", "approved"]);
export const messageRole = pgEnum("message_role", ["user", "assistant", "system"]);
export const generationStatus = pgEnum("generation_status", ["queued", "processing", "succeeded", "failed"]);
export const contentFormat = pgEnum("content_format", ["feed", "story"]);
export const qualityStatus = pgEnum("quality_status", ["draft", "approved"]);
export const imageJobStatus = pgEnum("image_job_status", ["queued", "processing", "succeeded", "failed"]);
export const integrationStatus = pgEnum("integration_status", ["active", "expired", "revoked", "error"]);
export const publishStatus = pgEnum("publish_status", ["processing", "succeeded", "failed"]);
export const scheduleStatus = pgEnum("schedule_status", ["scheduled", "processing", "cancelled", "published", "failed"]);
export const taskStatus = pgEnum("task_status", ["todo", "in_progress", "done", "snoozed", "skipped"]);
export const taskSetStatus = pgEnum("task_set_status", ["active", "closed"]);
export const reportStatus = pgEnum("report_status", ["generating", "preliminary", "final", "stale", "failed"]);
export const contentPlanStatus = pgEnum("content_plan_status", ["planned", "generating", "ready", "partial", "failed"]);
export const contentPlanItemStatus = pgEnum("content_plan_item_status", ["planned", "queued", "draft", "approved", "scheduled", "failed"]);
export const metricAvailability = pgEnum("metric_availability", ["available", "not_supported", "permission_missing", "temporarily_unavailable", "delayed", "failed"]);
export const instagramMediaStatus = pgEnum("instagram_media_status", ["published", "metric_unavailable"]);

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  instagramHandle: text("instagram_handle"),
  contactPhone: text("contact_phone"),
  timezone: text("timezone").notNull().default("Asia/Makassar"),
});

export const instagramConnections = pgTable("instagram_connections", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  instagramUserId: text("instagram_user_id").notNull(),
  username: text("username").notNull(),
  accountType: text("account_type").notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  scopes: text("scopes").array().notNull(),
  status: integrationStatus("status").notNull(),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const instagramOauthStates = pgTable("instagram_oauth_states", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  stateHash: text("state_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  materials: text("materials"),
  price: numeric("price", { precision: 12, scale: 2 }),
  imagePath: text("image_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  channel: conversationChannel("channel").notNull(),
  state: conversationState("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey(),
  conversationId: uuid("conversation_id").notNull(),
  role: messageRole("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const contentGenerations = pgTable("content_generations", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  productId: uuid("product_id").notNull(),
  conversationId: uuid("conversation_id").notNull(),
  status: generationStatus("status").notNull(),
  format: contentFormat("format").notNull(),
  requestPayload: jsonb("request_payload").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  imageStatus: imageJobStatus("image_status"),
  imageJobId: text("image_job_id"),
  imageError: text("image_error"),
});

export const contentOutputs = pgTable("content_outputs", {
  id: uuid("id").primaryKey(),
  generationId: uuid("generation_id").notNull(),
  version: integer("version").notNull(),
  imagePath: text("image_path"),
  captionId: text("caption_id").notNull(),
  captionEn: text("caption_en").notNull(),
  hashtags: jsonb("hashtags").notNull(),
  creativeBrief: jsonb("creative_brief").notNull(),
  qualityStatus: qualityStatus("quality_status").notNull(),
  isSelected: boolean("is_selected").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const instagramPublishJobs = pgTable("instagram_publish_jobs", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  connectionId: uuid("connection_id").notNull(),
  generationId: uuid("generation_id").notNull(),
  mediaType: text("media_type").notNull(),
  caption: text("caption").notNull(),
  containerId: text("container_id"),
  providerMediaId: text("provider_media_id"),
  status: publishStatus("status").notNull(),
  providerError: text("provider_error"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  generationMediaTypeUnique: uniqueIndex("instagram_publish_jobs_generation_media_type_unique").on(table.generationId, table.mediaType),
}));

export const instagramMedia = pgTable("instagram_media", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  publishJobId: uuid("publish_job_id").references(() => instagramPublishJobs.id, { onDelete: "set null" }),
  generationId: uuid("generation_id").references(() => contentGenerations.id, { onDelete: "set null" }),
  externalMediaId: text("external_media_id").notNull(),
  permalink: text("permalink"),
  mediaType: text("media_type").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  status: instagramMediaStatus("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  businessExternalUnique: uniqueIndex("instagram_media_business_external_unique").on(table.businessId, table.externalMediaId),
  businessPublishedIndex: index("instagram_media_business_published_idx").on(table.businessId, table.publishedAt),
}));

export const instagramMetricSnapshots = pgTable("instagram_metric_snapshots", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  instagramMediaId: uuid("instagram_media_id").notNull().references(() => instagramMedia.id, { onDelete: "cascade" }),
  collectedAt: timestamp("collected_at", { withTimezone: true }).notNull(),
  windowHours: integer("window_hours").notNull(),
  likes: integer("likes"),
  comments: integer("comments"),
  views: integer("views"),
  reach: integer("reach"),
  saves: integer("saves"),
  shares: integer("shares"),
  reposts: integer("reposts"),
  totalInteractions: integer("total_interactions"),
  availabilityStatus: metricAvailability("availability_status").notNull(),
  source: text("source").notNull().default("instagram_insights"),
  providerRequestId: text("provider_request_id"),
  errorCode: text("error_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  mediaWindowUnique: uniqueIndex("instagram_metric_snapshots_media_window_unique").on(table.instagramMediaId, table.windowHours),
  businessCollectedIndex: index("instagram_metric_snapshots_business_collected_idx").on(table.businessId, table.collectedAt),
  mediaCollectedIndex: index("instagram_metric_snapshots_media_collected_idx").on(table.instagramMediaId, table.collectedAt),
}));

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull(),
  actorUserId: uuid("actor_user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  requestId: text("request_id").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const instagramSchedules = pgTable("instagram_schedules", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  generationId: uuid("generation_id").notNull().references(() => contentGenerations.id, { onDelete: "cascade" }),
  mediaType: text("media_type").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  status: scheduleStatus("status").notNull(),
  caption: text("caption").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
}, (table) => ({
  businessIdempotencyUnique: uniqueIndex("instagram_schedules_business_idempotency_unique").on(table.businessId, table.idempotencyKey),
  businessCreatedIndex: index("instagram_schedules_business_created_idx").on(table.businessId, table.createdAt),
  dueIndex: index("instagram_schedules_due_idx").on(table.status, table.scheduledFor),
  generationIndex: index("instagram_schedules_generation_idx").on(table.generationId),
}));

export const weeklyTaskSets = pgTable("weekly_task_sets", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull(),
  status: taskSetStatus("status").notNull().default("active"),
  generationKey: text("generation_key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  periodUnique: uniqueIndex("weekly_task_sets_business_period_unique").on(table.businessId, table.periodStart, table.periodEnd, table.timezone),
  businessCreatedIndex: index("weekly_task_sets_business_created_idx").on(table.businessId, table.createdAt),
}));

export const weeklyTasks = pgTable("weekly_tasks", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  taskSetId: uuid("task_set_id").notNull().references(() => weeklyTaskSets.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: integer("priority").notNull(),
  status: taskStatus("status").notNull().default("todo"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  contentGenerationId: uuid("content_generation_id").references(() => contentGenerations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  businessCreatedIndex: index("weekly_tasks_business_created_idx").on(table.businessId, table.createdAt),
  taskSetIndex: index("weekly_tasks_task_set_idx").on(table.taskSetId),
  statusIndex: index("weekly_tasks_business_status_idx").on(table.businessId, table.status),
}));

export const taskActions = pgTable("task_actions", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").notNull().references(() => weeklyTasks.id, { onDelete: "cascade" }),
  fromStatus: taskStatus("from_status").notNull(),
  toStatus: taskStatus("to_status").notNull(),
  actorUserId: uuid("actor_user_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  businessCreatedIndex: index("task_actions_business_created_idx").on(table.businessId, table.createdAt),
  taskCreatedIndex: index("task_actions_task_created_idx").on(table.taskId, table.createdAt),
}));

export const weeklyReports = pgTable("weekly_reports", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
  periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull(),
  status: reportStatus("status").notNull(),
  dataThrough: timestamp("data_through", { withTimezone: true }).notNull(),
  totalTasks: integer("total_tasks").notNull(),
  completedTasks: integer("completed_tasks").notNull(),
  snoozedTasks: integer("snoozed_tasks").notNull(),
  skippedTasks: integer("skipped_tasks").notNull(),
  completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
  publishedPosts: integer("published_posts").notNull(),
  failedPosts: integer("failed_posts").notNull(),
  scheduledPostsNextPeriod: integer("scheduled_posts_next_period").notNull(),
  instagramStatus: text("instagram_status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  businessPeriodUnique: uniqueIndex("weekly_reports_business_period_unique").on(table.businessId, table.periodStart, table.periodEnd, table.timezone),
  businessPeriodIndex: index("weekly_reports_business_period_idx").on(table.businessId, table.periodStart),
}));

export const reportRecommendations = pgTable("report_recommendations", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  weeklyReportId: uuid("weekly_report_id").notNull().references(() => weeklyReports.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
  action: text("action").notNull(),
  evidence: jsonb("evidence").notNull(),
  confidence: text("confidence").notNull(),
  source: text("source").notNull().default("rules"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
}, (table) => ({
  reportTypeUnique: uniqueIndex("report_recommendations_report_type_unique").on(table.weeklyReportId, table.type),
  businessCreatedIndex: index("report_recommendations_business_created_idx").on(table.businessId, table.createdAt),
}));

export const weeklyContentPlans = pgTable("weekly_content_plans", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  weeklyReportId: uuid("weekly_report_id").notNull().references(() => weeklyReports.id, { onDelete: "cascade" }),
  targetPosts: integer("target_posts").notNull(),
  status: contentPlanStatus("status").notNull().default("planned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  reportUnique: uniqueIndex("weekly_content_plans_report_unique").on(table.weeklyReportId),
  businessCreatedIndex: index("weekly_content_plans_business_created_idx").on(table.businessId, table.createdAt),
}));

export const weeklyContentPlanItems = pgTable("weekly_content_plan_items", {
  id: uuid("id").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => weeklyContentPlans.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  format: contentFormat("format").notNull(),
  angle: text("angle").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  status: contentPlanItemStatus("status").notNull().default("planned"),
  generationId: uuid("generation_id").references(() => contentGenerations.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
}, (table) => ({
  planSequenceUnique: uniqueIndex("weekly_content_plan_items_plan_sequence_unique").on(table.planId, table.sequence),
  businessScheduledIndex: index("weekly_content_plan_items_business_scheduled_idx").on(table.businessId, table.scheduledFor),
}));
