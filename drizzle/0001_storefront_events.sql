CREATE TABLE "storefront_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_name" varchar(80) NOT NULL,
  "event_id" varchar(128) NOT NULL,
  "session_id" varchar(128),
  "product_id" uuid,
  "order_id" uuid,
  "path" text,
  "referrer" text,
  "source" varchar(160),
  "medium" varchar(160),
  "campaign" varchar(160),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "storefront_events_event_unique" UNIQUE("event_id")
);
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "storefront_events" ADD CONSTRAINT "storefront_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "storefront_events_name_created_idx" ON "storefront_events" USING btree ("event_name","created_at");
CREATE INDEX "storefront_events_source_created_idx" ON "storefront_events" USING btree ("source","created_at");
CREATE INDEX "storefront_events_product_created_idx" ON "storefront_events" USING btree ("product_id","created_at");
