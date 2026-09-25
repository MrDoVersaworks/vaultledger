ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar(20) NOT NULL DEFAULT 'user';
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "users" GROUP BY lower(trim("email")) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Cannot normalize users.email: case-insensitive duplicates exist';
  END IF;
END $$;
--> statement-breakpoint
UPDATE "users" SET "email" = lower(trim("email"));
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_lower_unique" ON "users" (lower("email"));
