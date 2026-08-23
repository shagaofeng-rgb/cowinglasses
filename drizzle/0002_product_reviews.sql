CREATE TABLE "product_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "customer_id" uuid,
  "rating" integer NOT NULL,
  "title" varchar(255),
  "body" text,
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "admin_reply" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "product_reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "product_reviews_product_status_created_idx" ON "product_reviews" USING btree ("product_id", "status", "created_at");
CREATE INDEX "product_reviews_status_created_idx" ON "product_reviews" USING btree ("status", "created_at");
