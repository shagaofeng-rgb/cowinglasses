CREATE TABLE "web_visitors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "visitor_hash" varchar(128) NOT NULL,
  "customer_id" uuid,
  "visit_count" integer DEFAULT 0 NOT NULL,
  "first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "web_visitors" ADD CONSTRAINT "web_visitors_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE set null ON UPDATE no action;
CREATE UNIQUE INDEX "web_visitors_hash_unique" ON "web_visitors" USING btree ("visitor_hash");
CREATE INDEX "web_visitors_customer_idx" ON "web_visitors" USING btree ("customer_id");
CREATE INDEX "web_visitors_last_seen_idx" ON "web_visitors" USING btree ("last_seen_at");

CREATE TABLE "web_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "visitor_id" uuid NOT NULL,
  "client_session_id" varchar(128) NOT NULL,
  "visit_number" integer NOT NULL,
  "entry_path" text,
  "exit_path" text,
  "referrer" text,
  "referrer_host" varchar(255),
  "source" varchar(160),
  "medium" varchar(160),
  "campaign" varchar(160),
  "country_code" varchar(8),
  "country_name" varchar(120),
  "ip_hash" varchar(128),
  "ip_masked" varchar(96),
  "encrypted_ip" text,
  "ip_expires_at" timestamp with time zone,
  "device_type" varchar(32),
  "browser" varchar(80),
  "operating_system" varchar(80),
  "user_agent" text,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "web_sessions" ADD CONSTRAINT "web_sessions_visitor_id_web_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "web_visitors"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "web_sessions_client_session_unique" ON "web_sessions" USING btree ("client_session_id");
CREATE INDEX "web_sessions_visitor_started_idx" ON "web_sessions" USING btree ("visitor_id", "started_at");
CREATE INDEX "web_sessions_source_started_idx" ON "web_sessions" USING btree ("source", "started_at");
CREATE INDEX "web_sessions_country_started_idx" ON "web_sessions" USING btree ("country_code", "started_at");
CREATE INDEX "web_sessions_last_seen_idx" ON "web_sessions" USING btree ("last_seen_at");

ALTER TABLE "storefront_events" ADD COLUMN "visitor_id" uuid;
ALTER TABLE "storefront_events" ADD COLUMN "visit_session_id" uuid;
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_visitor_id_web_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "web_visitors"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_visit_session_id_web_sessions_id_fk" FOREIGN KEY ("visit_session_id") REFERENCES "web_sessions"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "storefront_events_visit_session_created_idx" ON "storefront_events" USING btree ("visit_session_id", "created_at");
CREATE INDEX "storefront_events_visitor_created_idx" ON "storefront_events" USING btree ("visitor_id", "created_at");

CREATE TABLE "order_attributions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "customer_id" uuid,
  "visitor_id" uuid,
  "first_source" varchar(160),
  "first_medium" varchar(160),
  "first_campaign" varchar(160),
  "last_source" varchar(160),
  "last_medium" varchar(160),
  "last_campaign" varchar(160),
  "country_code" varchar(8),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "order_attributions" ADD CONSTRAINT "order_attributions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_attributions" ADD CONSTRAINT "order_attributions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "order_attributions" ADD CONSTRAINT "order_attributions_visitor_id_web_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "web_visitors"("id") ON DELETE set null ON UPDATE no action;
CREATE UNIQUE INDEX "order_attributions_order_unique" ON "order_attributions" USING btree ("order_id");
CREATE INDEX "order_attributions_last_source_idx" ON "order_attributions" USING btree ("last_source");
CREATE INDEX "order_attributions_visitor_idx" ON "order_attributions" USING btree ("visitor_id");

CREATE TABLE "traffic_daily_rollups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "day" date NOT NULL,
  "source" varchar(160) NOT NULL,
  "medium" varchar(160) NOT NULL,
  "country_code" varchar(8) NOT NULL,
  "sessions" integer DEFAULT 0 NOT NULL,
  "visitors" integer DEFAULT 0 NOT NULL,
  "page_views" integer DEFAULT 0 NOT NULL,
  "add_to_carts" integer DEFAULT 0 NOT NULL,
  "checkouts" integer DEFAULT 0 NOT NULL,
  "orders" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "traffic_daily_rollups_dimension_unique" ON "traffic_daily_rollups" USING btree ("day", "source", "medium", "country_code");
CREATE INDEX "traffic_daily_rollups_day_idx" ON "traffic_daily_rollups" USING btree ("day");
