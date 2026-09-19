DO $$ BEGIN
 CREATE TYPE "public"."refund_request_status" AS ENUM('requested', 'rejected', 'processing', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refund_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_paise" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "refund_request_status" DEFAULT 'requested' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"admin_note" text,
	"reviewed_by" uuid,
	"gateway_refund_id" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_requests_user_id_idx" ON "refund_requests" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_requests_order_id_idx" ON "refund_requests" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_requests_status_idx" ON "refund_requests" USING btree ("status");
