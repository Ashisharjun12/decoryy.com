ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'vendor_staff';--> statement-breakpoint
CREATE TYPE "public"."vendor_member_kind" AS ENUM('OWNER', 'WORKER');--> statement-breakpoint
CREATE TYPE "public"."vendor_member_status" AS ENUM('invited', 'active', 'disabled');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"user_id" uuid,
	"invited_phone" text NOT NULL,
	"display_name" text NOT NULL,
	"kind" "vendor_member_kind" DEFAULT 'WORKER' NOT NULL,
	"status" "vendor_member_status" DEFAULT 'invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_field_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "order_field_assignments" ADD CONSTRAINT "order_field_assignments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "order_field_assignments" ADD CONSTRAINT "order_field_assignments_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "order_field_assignments" ADD CONSTRAINT "order_field_assignments_member_id_vendor_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."vendor_members"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
DO $mig$ BEGIN ALTER TABLE "order_field_assignments" ADD CONSTRAINT "order_field_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_members_vendor_user_uidx" ON "vendor_members" USING btree ("vendor_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_members_vendor_phone_uidx" ON "vendor_members" USING btree ("vendor_id","invited_phone");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "order_field_assignments_order_member_uidx" ON "order_field_assignments" USING btree ("order_id","member_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_field_assignments_member_id_idx" ON "order_field_assignments" USING btree ("member_id");--> statement-breakpoint
INSERT INTO "vendor_members" ("vendor_id", "user_id", "invited_phone", "display_name", "kind", "status")
SELECT v.id, v.user_id, u.phone, u.name, 'OWNER'::"vendor_member_kind", 'active'::"vendor_member_status"
FROM "vendors" v
INNER JOIN "users" u ON u.id = v.user_id
WHERE v.onboarding_status = 'ACTIVE'
  AND u.phone IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "vendor_members" m WHERE m.vendor_id = v.id AND m.kind = 'OWNER'
  );
