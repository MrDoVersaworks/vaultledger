ALTER TABLE "platform_reviews" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'pending';
--> statement-breakpoint
UPDATE "platform_reviews" SET "status" = 'approved' WHERE "status" = 'pending';
