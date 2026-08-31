CREATE TABLE IF NOT EXISTS "customer_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "password_hash" text NOT NULL,
  "status" varchar(24) DEFAULT 'active' NOT NULL,
  "failed_login_attempts" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamptz,
  "last_login_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_accounts_customer_unique" ON "customer_accounts" ("customer_id");
CREATE INDEX IF NOT EXISTS "customer_accounts_status_idx" ON "customer_accounts" ("status");

CREATE TABLE IF NOT EXISTS "customer_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "session_token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "customer_sessions_token_unique" ON "customer_sessions" ("session_token_hash");
CREATE INDEX IF NOT EXISTS "customer_sessions_customer_idx" ON "customer_sessions" ("customer_id");
CREATE INDEX IF NOT EXISTS "customer_sessions_expires_idx" ON "customer_sessions" ("expires_at");

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_id" uuid;
CREATE INDEX IF NOT EXISTS "orders_coupon_idx" ON "orders" ("coupon_id");
