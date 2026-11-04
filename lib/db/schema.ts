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

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey(),
  ownerId: uuid("owner_id").notNull(),
  name: text("name").notNull(),
  instagramHandle: text("instagram_handle"),
  contactPhone: text("contact_phone"),
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
