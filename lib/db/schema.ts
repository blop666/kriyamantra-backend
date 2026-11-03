import { boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const conversationChannel = pgEnum("conversation_channel", ["web", "whatsapp"]);
export const conversationState = pgEnum("conversation_state", ["collect_context", "ask_missing_data", "confirm_generation", "generating", "review_output", "revision", "approved"]);
export const messageRole = pgEnum("message_role", ["user", "assistant", "system"]);
export const generationStatus = pgEnum("generation_status", ["queued", "processing", "succeeded", "failed"]);
export const contentFormat = pgEnum("content_format", ["feed", "story"]);
export const qualityStatus = pgEnum("quality_status", ["draft", "approved"]);
export const imageJobStatus = pgEnum("image_job_status", ["queued", "processing", "succeeded", "failed"]);
export const integrationStatus = pgEnum("integration_status", ["active", "expired", "revoked", "error"]);
export const publishStatus = pgEnum("publish_status", ["processing", "succeeded", "failed"]);

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
});
