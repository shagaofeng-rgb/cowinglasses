ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "image_alt" varchar(255);
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "author_name" varchar(160) DEFAULT 'CoWin Editorial Team' NOT NULL;
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "editorial_disclaimer" text;
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "content_fingerprint" varchar(128);
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "automation_candidate_id" uuid;
ALTER TABLE "content_articles" ADD COLUMN IF NOT EXISTS "is_automated" boolean DEFAULT false NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "content_articles_fingerprint_unique" ON "content_articles" ("content_fingerprint");

CREATE TABLE IF NOT EXISTS "content_article_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL REFERENCES "content_articles"("id") ON DELETE cascade,
  "locale" varchar(8) NOT NULL,
  "title" varchar(255) NOT NULL,
  "excerpt" text,
  "body" text,
  "seo_title" varchar(255),
  "seo_description" varchar(320),
  "seo_keywords" text,
  "key_takeaways" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "content_article_translations_article_locale_unique" ON "content_article_translations" ("article_id", "locale");
CREATE INDEX IF NOT EXISTS "content_article_translations_locale_idx" ON "content_article_translations" ("locale");

CREATE TABLE IF NOT EXISTS "article_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL REFERENCES "content_articles"("id") ON DELETE cascade,
  "name" varchar(200) NOT NULL,
  "domain" varchar(255) NOT NULL,
  "url" text NOT NULL,
  "title" text,
  "author" varchar(200),
  "published_at" timestamptz,
  "is_primary" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "article_sources_article_url_unique" ON "article_sources" ("article_id", "url");
CREATE INDEX IF NOT EXISTS "article_sources_article_idx" ON "article_sources" ("article_id");

CREATE TABLE IF NOT EXISTS "news_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_key" varchar(96) NOT NULL,
  "name" varchar(200) NOT NULL,
  "domain" varchar(255) NOT NULL,
  "feed_url" text NOT NULL,
  "tier" varchar(16) DEFAULT 'secondary' NOT NULL,
  "trust_score" integer DEFAULT 70 NOT NULL,
  "allowed_topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "health_status" varchar(24) DEFAULT 'unknown' NOT NULL,
  "consecutive_failures" integer DEFAULT 0 NOT NULL,
  "last_checked_at" timestamptz,
  "last_success_at" timestamptz,
  "last_error" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "news_sources_key_unique" ON "news_sources" ("source_key");
CREATE UNIQUE INDEX IF NOT EXISTS "news_sources_feed_unique" ON "news_sources" ("feed_url");
CREATE INDEX IF NOT EXISTS "news_sources_active_health_idx" ON "news_sources" ("is_active", "health_status");

CREATE TABLE IF NOT EXISTS "news_candidates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_id" uuid NOT NULL REFERENCES "news_sources"("id") ON DELETE restrict,
  "source_url" text NOT NULL,
  "normalized_url" text NOT NULL,
  "url_hash" varchar(128) NOT NULL,
  "title" text NOT NULL,
  "title_hash" varchar(128) NOT NULL,
  "summary" text NOT NULL,
  "content_fingerprint" varchar(128) NOT NULL,
  "source_author" varchar(200),
  "source_published_at" timestamptz NOT NULL,
  "topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "score" integer DEFAULT 0 NOT NULL,
  "status" varchar(32) DEFAULT 'discovered' NOT NULL,
  "reject_reason" text,
  "attempts" integer DEFAULT 0 NOT NULL,
  "reserved_cycle" varchar(80),
  "used_article_id" uuid REFERENCES "content_articles"("id") ON DELETE set null,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "news_candidates_url_hash_unique" ON "news_candidates" ("url_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "news_candidates_fingerprint_unique" ON "news_candidates" ("content_fingerprint");
CREATE INDEX IF NOT EXISTS "news_candidates_status_score_idx" ON "news_candidates" ("status", "score");
CREATE INDEX IF NOT EXISTS "news_candidates_source_published_idx" ON "news_candidates" ("source_published_at");

CREATE TABLE IF NOT EXISTS "news_automation_state" (
  "key" varchar(64) PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "publishing_mode" varchar(24) DEFAULT 'review' NOT NULL,
  "interval_hours" integer DEFAULT 48 NOT NULL,
  "min_score" integer DEFAULT 70 NOT NULL,
  "last_ingest_at" timestamptz,
  "last_published_at" timestamptz,
  "next_eligible_at" timestamptz,
  "topic_cursor" integer DEFAULT 0 NOT NULL,
  "updated_by" uuid REFERENCES "admin_users"("id") ON DELETE set null,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "news_automation_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "kind" varchar(24) NOT NULL,
  "trigger" varchar(24) NOT NULL,
  "status" varchar(32) NOT NULL,
  "candidate_count" integer DEFAULT 0 NOT NULL,
  "rejected_count" integer DEFAULT 0 NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "published_article_id" uuid REFERENCES "content_articles"("id") ON DELETE set null,
  "published_slug" varchar(260),
  "reason" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "started_at" timestamptz DEFAULT now() NOT NULL,
  "finished_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "news_automation_runs_started_idx" ON "news_automation_runs" ("started_at");
CREATE INDEX IF NOT EXISTS "news_automation_runs_status_idx" ON "news_automation_runs" ("status");

CREATE TABLE IF NOT EXISTS "news_delivery_checks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL REFERENCES "content_articles"("id") ON DELETE cascade,
  "passed" boolean DEFAULT false NOT NULL,
  "results" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "error" text,
  "checked_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "news_delivery_checks_article_idx" ON "news_delivery_checks" ("article_id");
CREATE INDEX IF NOT EXISTS "news_delivery_checks_checked_idx" ON "news_delivery_checks" ("checked_at");

CREATE TABLE IF NOT EXISTS "news_job_locks" (
  "lock_key" varchar(96) PRIMARY KEY NOT NULL,
  "token" uuid NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "news_job_locks_expires_idx" ON "news_job_locks" ("expires_at");
