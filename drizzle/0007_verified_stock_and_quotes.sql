CREATE TYPE "public"."quote_status" AS ENUM('new', 'in_review', 'quoted', 'closed');
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_key" uuid NOT NULL,
	"reference" varchar(32) NOT NULL,
	"product_id" uuid,
	"sku_id" uuid,
	"model" varchar(240),
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(160),
	"destination" varchar(120) NOT NULL,
	"quantity" integer NOT NULL,
	"purpose" varchar(32) NOT NULL,
	"message" text,
	"locale" varchar(8) NOT NULL,
	"status" "quote_status" DEFAULT 'new' NOT NULL,
	"assigned_to" uuid,
	"quote_amount_usd" numeric(12, 2),
	"follow_up_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory_levels" ADD COLUMN "verified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_key" uuid;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_fingerprint" varchar(64);
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_assigned_to_admin_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "quote_requests_key_unique" ON "quote_requests" USING btree ("request_key");
--> statement-breakpoint
CREATE UNIQUE INDEX "quote_requests_reference_unique" ON "quote_requests" USING btree ("reference");
--> statement-breakpoint
CREATE INDEX "quote_requests_status_created_idx" ON "quote_requests" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX "quote_requests_email_created_idx" ON "quote_requests" USING btree ("email","created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "orders_checkout_key_unique" ON "orders" USING btree ("checkout_key");
