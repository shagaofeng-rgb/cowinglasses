CREATE TYPE "public"."admin_status" AS ENUM('active', 'invited', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."aftersales_status" AS ENUM('requested', 'approved', 'rejected', 'received', 'refunding', 'refunded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."channel_connection_status" AS ENUM('not_connected', 'pending', 'connected', 'error', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'scheduled', 'published', 'offline');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'processing', 'partially_shipped', 'shipped', 'delivered', 'exception');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type" AS ENUM('initial', 'inbound', 'outbound', 'reservation', 'release', 'adjustment', 'return');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_payment', 'paid', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled', 'refunded', 'closed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"session_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_user_roles" (
	"admin_user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_roles_pk" PRIMARY KEY("admin_user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"status" "admin_status" DEFAULT 'invited' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aftersales_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" varchar(96) NOT NULL,
	"order_id" uuid NOT NULL,
	"customer_id" uuid,
	"type" varchar(32) NOT NULL,
	"status" "aftersales_status" DEFAULT 'requested' NOT NULL,
	"reason" text,
	"resolution" text,
	"requested_amount" numeric(12, 2),
	"approved_amount" numeric(12, 2),
	"handled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(128) NOT NULL,
	"resource_type" varchar(128) NOT NULL,
	"resource_id" varchar(128),
	"request_id" varchar(96),
	"source_ip" varchar(64),
	"user_agent" text,
	"result" varchar(32) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"placement" varchar(80) NOT NULL,
	"image_url" text NOT NULL,
	"mobile_image_url" text,
	"target_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "channel_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" varchar(64) NOT NULL,
	"status" "channel_connection_status" DEFAULT 'not_connected' NOT NULL,
	"encrypted_credentials" text,
	"configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(32) NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"excerpt" text,
	"body" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"seo_title" varchar(255),
	"seo_description" varchar(320),
	"seo_keywords" text,
	"index_status" varchar(32) DEFAULT 'unknown' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(80) NOT NULL,
	"discount_type" varchar(32) NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"minimum_amount" numeric(12, 2),
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_loyalty_ledgers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"points_delta" integer DEFAULT 0 NOT NULL,
	"balance_delta" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reason" varchar(120) NOT NULL,
	"reference_type" varchar(64),
	"reference_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_tag_assignments" (
	"customer_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_tag_assignments_pk" PRIMARY KEY("customer_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "customer_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"color" varchar(24),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320),
	"phone" varchar(64),
	"first_name" varchar(120),
	"last_name" varchar(120),
	"source" varchar(80),
	"notes" text,
	"accepts_marketing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku_id" uuid NOT NULL,
	"location_code" varchar(64) DEFAULT 'default' NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku_id" uuid NOT NULL,
	"type" "inventory_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"reference_type" varchar(64),
	"reference_id" varchar(128),
	"note" text,
	"operator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(64) NOT NULL,
	"object_key" text NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(128),
	"size_bytes" integer,
	"alt_text" varchar(255),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"threshold_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"benefits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"sku_id" uuid,
	"product_name" varchar(240) NOT NULL,
	"sku_code" varchar(128),
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(64) NOT NULL,
	"customer_id" uuid,
	"status" "order_status" DEFAULT 'pending_payment' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"subtotal_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shipping_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"source" varchar(80) DEFAULT 'storefront' NOT NULL,
	"shipping_address" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"billing_address" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"note" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"transaction_number" varchar(160) NOT NULL,
	"provider_reference" varchar(200),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"raw_payload" jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(128) NOT NULL,
	"name" varchar(120) NOT NULL,
	"module" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku_id" uuid,
	"url" text NOT NULL,
	"alt_text" varchar(255),
	"media_type" varchar(32) DEFAULT 'image' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_option_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"option_id" uuid NOT NULL,
	"value" varchar(160) NOT NULL,
	"swatch_value" varchar(48),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_skus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(128) NOT NULL,
	"barcode" varchar(128),
	"option_value_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"compare_at_price" numeric(12, 2),
	"cost_price" numeric(12, 2),
	"weight_grams" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"brand_id" uuid,
	"supplier_id" uuid,
	"name" varchar(240) NOT NULL,
	"slug" varchar(260) NOT NULL,
	"short_description" text,
	"description" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"seo_title" varchar(255),
	"seo_description" varchar(320),
	"seo_keywords" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"type" varchar(64) NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"refund_number" varchar(96) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"provider_reference" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_items" (
	"shipment_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "shipment_items_pk" PRIMARY KEY("shipment_id","order_item_id")
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(80),
	"tracking_number" varchar(160),
	"status" "fulfillment_status" DEFAULT 'processing' NOT NULL,
	"label_url" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"contact_name" varchar(160),
	"email" varchar(320),
	"phone" varchar(64),
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_connection_id" uuid,
	"type" varchar(64) NOT NULL,
	"status" "sync_status" DEFAULT 'queued' NOT NULL,
	"request_payload" jsonb,
	"result" jsonb,
	"error_message" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(64) NOT NULL,
	"external_event_id" varchar(200) NOT NULL,
	"event_type" varchar(128) NOT NULL,
	"signature_valid" boolean DEFAULT false NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"processing_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user_roles" ADD CONSTRAINT "admin_user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aftersales_requests" ADD CONSTRAINT "aftersales_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aftersales_requests" ADD CONSTRAINT "aftersales_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aftersales_requests" ADD CONSTRAINT "aftersales_requests_handled_by_admin_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_admin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_loyalty_ledgers" ADD CONSTRAINT "customer_loyalty_ledgers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_tag_assignments" ADD CONSTRAINT "customer_tag_assignments_tag_id_customer_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."customer_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD CONSTRAINT "inventory_levels_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_operator_id_admin_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_jobs" ADD CONSTRAINT "sync_jobs_channel_connection_id_channel_connections_id_fk" FOREIGN KEY ("channel_connection_id") REFERENCES "public"."channel_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_unique" ON "admin_sessions" USING btree ("session_token_hash");--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("admin_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_users_status_idx" ON "admin_users" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "aftersales_number_unique" ON "aftersales_requests" USING btree ("request_number");--> statement-breakpoint
CREATE INDEX "aftersales_status_created_idx" ON "aftersales_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "aftersales_order_idx" ON "aftersales_requests" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_idx" ON "audit_logs" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_created_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "banners_placement_active_idx" ON "banners" USING btree ("placement","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_unique" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "channel_connections_channel_unique" ON "channel_connections" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "channel_connections_status_idx" ON "channel_connections" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "content_articles_type_slug_unique" ON "content_articles" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "content_articles_status_published_idx" ON "content_articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_unique" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_active_dates_idx" ON "coupons" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "customer_loyalty_customer_created_idx" ON "customer_loyalty_ledgers" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_tags_name_unique" ON "customer_tags" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_unique" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_created_idx" ON "customers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customers_source_idx" ON "customers" USING btree ("source");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_levels_sku_location_unique" ON "inventory_levels" USING btree ("sku_id","location_code");--> statement-breakpoint
CREATE INDEX "inventory_levels_reorder_idx" ON "inventory_levels" USING btree ("reorder_point");--> statement-breakpoint
CREATE INDEX "inventory_movements_sku_created_idx" ON "inventory_movements" USING btree ("sku_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_reference_idx" ON "inventory_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_provider_object_unique" ON "media_assets" USING btree ("provider","object_key");--> statement-breakpoint
CREATE INDEX "media_assets_created_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_tiers_name_unique" ON "membership_tiers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_sku_idx" ON "order_items" USING btree ("sku_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_unique" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_customer_created_idx" ON "orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_transaction_unique" ON "payments" USING btree ("transaction_number");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_provider_reference_idx" ON "payments" USING btree ("provider","provider_reference");--> statement-breakpoint
CREATE INDEX "payments_status_created_idx" ON "payments" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "product_media_product_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_sku_idx" ON "product_media" USING btree ("sku_id");--> statement-breakpoint
CREATE INDEX "product_option_values_option_idx" ON "product_option_values" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "product_options_product_idx" ON "product_options" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_skus_sku_unique" ON "product_skus" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_skus_product_idx" ON "product_skus" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_published_idx" ON "products" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "promotions_active_dates_idx" ON "promotions" USING btree ("is_active","starts_at","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "refunds_number_unique" ON "refunds" USING btree ("refund_number");--> statement-breakpoint
CREATE INDEX "refunds_order_idx" ON "refunds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "refunds_payment_idx" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_code_unique" ON "roles" USING btree ("code");--> statement-breakpoint
CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "shipments_tracking_idx" ON "shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "suppliers_name_idx" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "sync_jobs_status_created_idx" ON "sync_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sync_jobs_connection_idx" ON "sync_jobs" USING btree ("channel_connection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_unique" ON "webhook_events" USING btree ("provider","external_event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_provider_type_idx" ON "webhook_events" USING btree ("provider","event_type");