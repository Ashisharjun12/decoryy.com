ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_change_password" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
DO $mig$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'admin_email_change_requests'
  ) THEN
    CREATE TABLE "admin_email_change_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "new_email" text NOT NULL,
      "token_hash" text NOT NULL,
      "expires_at" timestamp with time zone NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "used_at" timestamp with time zone
    );
  END IF;
END $mig$;
--> statement-breakpoint
DO $mig$ BEGIN
 ALTER TABLE "admin_email_change_requests" ADD CONSTRAINT "admin_email_change_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $mig$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_email_change_requests_user_id_idx" ON "admin_email_change_requests" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_email_change_requests_token_hash_idx" ON "admin_email_change_requests" USING btree ("token_hash");
