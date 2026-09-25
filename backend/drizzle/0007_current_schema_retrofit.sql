ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "encrypted_resend_key" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resend_key_iv" varchar(32);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resend_key_tag" varchar(32);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_email" varchar(255);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sender_name" varchar(255) NOT NULL,
  "sender_email" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false NOT NULL,
  "ai_screening_passed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "google_analytics_id" varchar(50),
  "termly_uuid" varchar(50),
  "privacy_policy_content" text,
  "terms_of_service_content" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
