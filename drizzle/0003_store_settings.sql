CREATE TABLE "store_settings" (
  "key" varchar(128) PRIMARY KEY NOT NULL,
  "value" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_by" uuid,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "admin_users"("id") ON DELETE set null ON UPDATE no action;
