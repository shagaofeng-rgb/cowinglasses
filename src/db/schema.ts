import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const adminStatus = pgEnum("admin_status", ["active", "invited", "suspended"]);
export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);
export const inventoryMovementType = pgEnum("inventory_movement_type", ["initial", "inbound", "outbound", "reservation", "release", "adjustment", "return"]);
export const orderStatus = pgEnum("order_status", ["pending_payment", "paid", "processing", "partially_shipped", "shipped", "delivered", "cancelled", "refunded", "closed"]);
export const paymentStatus = pgEnum("payment_status", ["pending", "authorized", "paid", "failed", "cancelled", "partially_refunded", "refunded"]);
export const fulfillmentStatus = pgEnum("fulfillment_status", ["unfulfilled", "processing", "partially_shipped", "shipped", "delivered", "exception"]);
export const aftersalesStatus = pgEnum("aftersales_status", ["requested", "approved", "rejected", "received", "refunding", "refunded", "closed"]);
export const contentStatus = pgEnum("content_status", ["draft", "scheduled", "published", "offline"]);
export const channelConnectionStatus = pgEnum("channel_connection_status", ["not_connected", "pending", "connected", "error", "disabled"]);
export const syncStatus = pgEnum("sync_status", ["queued", "running", "succeeded", "failed", "cancelled"]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  status: adminStatus("status").default("invited").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("admin_users_email_unique").on(table.email), index("admin_users_status_idx").on(table.status)]);

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("roles_code_unique").on(table.code)]);

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 128 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  module: varchar("module", { length: 64 }).notNull(),
  createdAt,
}, (table) => [uniqueIndex("permissions_code_unique").on(table.code), index("permissions_module_idx").on(table.module)]);

export const adminUserRoles = pgTable("admin_user_roles", {
  adminUserId: uuid("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  createdAt,
}, (table) => [primaryKey({ columns: [table.adminUserId, table.roleId], name: "admin_user_roles_pk" })]);

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt,
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId], name: "role_permissions_pk" })]);

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUserId: uuid("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  sessionTokenHash: text("session_token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt,
}, (table) => [uniqueIndex("admin_sessions_token_unique").on(table.sessionTokenHash), index("admin_sessions_user_idx").on(table.adminUserId)]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("categories_slug_unique").on(table.slug), index("categories_parent_idx").on(table.parentId)]);

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("brands_slug_unique").on(table.slug)]);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("suppliers_name_idx").on(table.name)]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  name: varchar("name", { length: 240 }).notNull(),
  slug: varchar("slug", { length: 260 }).notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  status: productStatus("status").default("draft").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: varchar("seo_description", { length: 320 }),
  seoKeywords: text("seo_keywords"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("products_slug_unique").on(table.slug), index("products_status_published_idx").on(table.status, table.publishedAt), index("products_category_idx").on(table.categoryId)]);

export const productOptions = pgTable("product_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt,
}, (table) => [index("product_options_product_idx").on(table.productId)]);

export const productOptionValues = pgTable("product_option_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  optionId: uuid("option_id").notNull().references(() => productOptions.id, { onDelete: "cascade" }),
  value: varchar("value", { length: 160 }).notNull(),
  swatchValue: varchar("swatch_value", { length: 48 }),
  position: integer("position").default(0).notNull(),
  createdAt,
}, (table) => [index("product_option_values_option_idx").on(table.optionId)]);

export const productSkus = pgTable("product_skus", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 128 }).notNull(),
  barcode: varchar("barcode", { length: 128 }),
  optionValueIds: jsonb("option_value_ids").$type<string[]>().default([]).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
  weightGrams: integer("weight_grams"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("product_skus_sku_unique").on(table.sku), index("product_skus_product_idx").on(table.productId)]);

export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  skuId: uuid("sku_id").references(() => productSkus.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  mediaType: varchar("media_type", { length: 32 }).default("image").notNull(),
  position: integer("position").default(0).notNull(),
  createdAt,
}, (table) => [index("product_media_product_idx").on(table.productId), index("product_media_sku_idx").on(table.skuId)]);

export const productReviews = pgTable("product_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  adminReply: text("admin_reply"),
  createdAt,
  updatedAt,
}, (table) => [index("product_reviews_product_status_created_idx").on(table.productId, table.status, table.createdAt), index("product_reviews_status_created_idx").on(table.status, table.createdAt)]);

export const inventoryLevels = pgTable("inventory_levels", {
  id: uuid("id").defaultRandom().primaryKey(),
  skuId: uuid("sku_id").notNull().references(() => productSkus.id, { onDelete: "cascade" }),
  locationCode: varchar("location_code", { length: 64 }).default("default").notNull(),
  onHand: integer("on_hand").default(0).notNull(),
  reserved: integer("reserved").default(0).notNull(),
  reorderPoint: integer("reorder_point").default(0).notNull(),
  updatedAt,
}, (table) => [uniqueIndex("inventory_levels_sku_location_unique").on(table.skuId, table.locationCode), index("inventory_levels_reorder_idx").on(table.reorderPoint)]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  skuId: uuid("sku_id").notNull().references(() => productSkus.id, { onDelete: "restrict" }),
  type: inventoryMovementType("type").notNull(),
  quantityDelta: integer("quantity_delta").notNull(),
  referenceType: varchar("reference_type", { length: 64 }),
  referenceId: varchar("reference_id", { length: 128 }),
  note: text("note"),
  operatorId: uuid("operator_id").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt,
}, (table) => [index("inventory_movements_sku_created_idx").on(table.skuId, table.createdAt), index("inventory_movements_reference_idx").on(table.referenceType, table.referenceId)]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  source: varchar("source", { length: 80 }),
  notes: text("notes"),
  acceptsMarketing: boolean("accepts_marketing").default(false).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("customers_email_unique").on(table.email), index("customers_created_idx").on(table.createdAt), index("customers_source_idx").on(table.source)]);

export const customerTags = pgTable("customer_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  color: varchar("color", { length: 24 }),
  createdAt,
}, (table) => [uniqueIndex("customer_tags_name_unique").on(table.name)]);

export const customerTagAssignments = pgTable("customer_tag_assignments", {
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => customerTags.id, { onDelete: "cascade" }),
  createdAt,
}, (table) => [primaryKey({ columns: [table.customerId, table.tagId], name: "customer_tag_assignments_pk" })]);

export const membershipTiers = pgTable("membership_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  thresholdAmount: numeric("threshold_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  benefits: jsonb("benefits").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("membership_tiers_name_unique").on(table.name)]);

export const customerLoyaltyLedgers = pgTable("customer_loyalty_ledgers", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  pointsDelta: integer("points_delta").default(0).notNull(),
  balanceDelta: numeric("balance_delta", { precision: 12, scale: 2 }).default("0").notNull(),
  reason: varchar("reason", { length: 120 }).notNull(),
  referenceType: varchar("reference_type", { length: 64 }),
  referenceId: varchar("reference_id", { length: 128 }),
  createdAt,
}, (table) => [index("customer_loyalty_customer_created_idx").on(table.customerId, table.createdAt)]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 64 }).notNull(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  status: orderStatus("status").default("pending_payment").notNull(),
  paymentStatus: paymentStatus("payment_status").default("pending").notNull(),
  fulfillmentStatus: fulfillmentStatus("fulfillment_status").default("unfulfilled").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  source: varchar("source", { length: 80 }).default("storefront").notNull(),
  shippingAddress: jsonb("shipping_address").$type<Record<string, unknown>>().default({}).notNull(),
  billingAddress: jsonb("billing_address").$type<Record<string, unknown>>().default({}).notNull(),
  note: text("note"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("orders_number_unique").on(table.orderNumber), index("orders_status_created_idx").on(table.status, table.createdAt), index("orders_customer_created_idx").on(table.customerId, table.createdAt), index("orders_payment_status_idx").on(table.paymentStatus)]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  skuId: uuid("sku_id").references(() => productSkus.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 240 }).notNull(),
  skuCode: varchar("sku_code", { length: 128 }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [index("order_items_order_idx").on(table.orderId), index("order_items_sku_idx").on(table.skuId)]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  provider: varchar("provider", { length: 64 }).notNull(),
  transactionNumber: varchar("transaction_number", { length: 160 }).notNull(),
  providerReference: varchar("provider_reference", { length: 200 }),
  status: paymentStatus("status").default("pending").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("payments_transaction_unique").on(table.transactionNumber), index("payments_order_idx").on(table.orderId), index("payments_provider_reference_idx").on(table.provider, table.providerReference), index("payments_status_created_idx").on(table.status, table.createdAt)]);

export const refunds = pgTable("refunds", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id").notNull().references(() => payments.id, { onDelete: "restrict" }),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  refundNumber: varchar("refund_number", { length: 96 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  status: paymentStatus("status").default("pending").notNull(),
  providerReference: varchar("provider_reference", { length: 200 }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("refunds_number_unique").on(table.refundNumber), index("refunds_order_idx").on(table.orderId), index("refunds_payment_idx").on(table.paymentId)]);

export const shipments = pgTable("shipments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  provider: varchar("provider", { length: 80 }),
  trackingNumber: varchar("tracking_number", { length: 160 }),
  status: fulfillmentStatus("status").default("processing").notNull(),
  labelUrl: text("label_url"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),
  createdAt,
  updatedAt,
}, (table) => [index("shipments_order_idx").on(table.orderId), index("shipments_tracking_idx").on(table.trackingNumber), index("shipments_status_idx").on(table.status)]);

export const shipmentItems = pgTable("shipment_items", {
  shipmentId: uuid("shipment_id").notNull().references(() => shipments.id, { onDelete: "cascade" }),
  orderItemId: uuid("order_item_id").notNull().references(() => orderItems.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
}, (table) => [primaryKey({ columns: [table.shipmentId, table.orderItemId], name: "shipment_items_pk" })]);

export const aftersalesRequests = pgTable("aftersales_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestNumber: varchar("request_number", { length: 96 }).notNull(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  type: varchar("type", { length: 32 }).notNull(),
  status: aftersalesStatus("status").default("requested").notNull(),
  reason: text("reason"),
  resolution: text("resolution"),
  requestedAmount: numeric("requested_amount", { precision: 12, scale: 2 }),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  handledBy: uuid("handled_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("aftersales_number_unique").on(table.requestNumber), index("aftersales_status_created_idx").on(table.status, table.createdAt), index("aftersales_order_idx").on(table.orderId)]);

export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 80 }).notNull(),
  discountType: varchar("discount_type", { length: 32 }).notNull(),
  discountValue: numeric("discount_value", { precision: 12, scale: 2 }).notNull(),
  minimumAmount: numeric("minimum_amount", { precision: 12, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("coupons_code_unique").on(table.code), index("coupons_active_dates_idx").on(table.isActive, table.startsAt, table.endsAt)]);

export const promotions = pgTable("promotions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  rules: jsonb("rules").$type<Record<string, unknown>>().default({}).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
}, (table) => [index("promotions_active_dates_idx").on(table.isActive, table.startsAt, table.endsAt)]);

export const contentArticles = pgTable("content_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 32 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 260 }).notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  status: contentStatus("status").default("draft").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: varchar("seo_description", { length: 320 }),
  seoKeywords: text("seo_keywords"),
  indexStatus: varchar("index_status", { length: 32 }).default("unknown").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("content_articles_type_slug_unique").on(table.type, table.slug), index("content_articles_status_published_idx").on(table.status, table.publishedAt)]);

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 64 }).notNull(),
  objectKey: text("object_key").notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 128 }),
  sizeBytes: integer("size_bytes"),
  altText: varchar("alt_text", { length: 255 }),
  createdBy: uuid("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
  createdAt,
}, (table) => [uniqueIndex("media_assets_provider_object_unique").on(table.provider, table.objectKey), index("media_assets_created_idx").on(table.createdAt)]);

export const banners = pgTable("banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  placement: varchar("placement", { length: 80 }).notNull(),
  imageUrl: text("image_url").notNull(),
  mobileImageUrl: text("mobile_image_url"),
  targetUrl: text("target_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt,
  updatedAt,
}, (table) => [index("banners_placement_active_idx").on(table.placement, table.isActive, table.sortOrder)]);

export const channelConnections = pgTable("channel_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  channel: varchar("channel", { length: 64 }).notNull(),
  status: channelConnectionStatus("status").default("not_connected").notNull(),
  encryptedCredentials: text("encrypted_credentials"),
  configuration: jsonb("configuration").$type<Record<string, unknown>>().default({}).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  lastError: text("last_error"),
  createdAt,
  updatedAt,
}, (table) => [uniqueIndex("channel_connections_channel_unique").on(table.channel), index("channel_connections_status_idx").on(table.status)]);

export const syncJobs = pgTable("sync_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  channelConnectionId: uuid("channel_connection_id").references(() => channelConnections.id, { onDelete: "set null" }),
  type: varchar("type", { length: 64 }).notNull(),
  status: syncStatus("status").default("queued").notNull(),
  requestPayload: jsonb("request_payload").$type<Record<string, unknown>>(),
  result: jsonb("result").$type<Record<string, unknown>>(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt,
}, (table) => [index("sync_jobs_status_created_idx").on(table.status, table.createdAt), index("sync_jobs_connection_idx").on(table.channelConnectionId)]);

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 64 }).notNull(),
  externalEventId: varchar("external_event_id", { length: 200 }).notNull(),
  eventType: varchar("event_type", { length: 128 }).notNull(),
  signatureValid: boolean("signature_valid").default(false).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingError: text("processing_error"),
  createdAt,
}, (table) => [uniqueIndex("webhook_events_provider_event_unique").on(table.provider, table.externalEventId), index("webhook_events_provider_type_idx").on(table.provider, table.eventType)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => adminUsers.id, { onDelete: "set null" }),
  action: varchar("action", { length: 128 }).notNull(),
  resourceType: varchar("resource_type", { length: 128 }).notNull(),
  resourceId: varchar("resource_id", { length: 128 }),
  requestId: varchar("request_id", { length: 96 }),
  sourceIp: varchar("source_ip", { length: 64 }),
  userAgent: text("user_agent"),
  result: varchar("result", { length: 32 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt), index("audit_logs_resource_idx").on(table.resourceType, table.resourceId), index("audit_logs_action_created_idx").on(table.action, table.createdAt)]);

export const storefrontEvents = pgTable("storefront_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 80 }).notNull(),
  eventId: varchar("event_id", { length: 128 }).notNull(),
  sessionId: varchar("session_id", { length: 128 }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  path: text("path"),
  referrer: text("referrer"),
  source: varchar("source", { length: 160 }),
  medium: varchar("medium", { length: 160 }),
  campaign: varchar("campaign", { length: 160 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt,
}, (table) => [uniqueIndex("storefront_events_event_unique").on(table.eventId), index("storefront_events_name_created_idx").on(table.eventName, table.createdAt), index("storefront_events_source_created_idx").on(table.source, table.createdAt), index("storefront_events_product_created_idx").on(table.productId, table.createdAt)]);
