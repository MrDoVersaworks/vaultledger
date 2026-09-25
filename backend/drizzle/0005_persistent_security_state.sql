CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "key" varchar(512) PRIMARY KEY NOT NULL,
  "hits" integer NOT NULL DEFAULT 0,
  "reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_reset_idx" ON "rate_limit_buckets" ("reset_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "revoked_access_tokens" (
  "signature" varchar(512) PRIMARY KEY NOT NULL,
  "expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "revoked_access_tokens_expires_idx" ON "revoked_access_tokens" ("expires_at");
