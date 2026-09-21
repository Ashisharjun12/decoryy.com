DO $$ BEGIN
 CREATE TYPE "public"."fulfillment_type" AS ENUM('scheduled', 'instant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dispatch_status" AS ENUM('idle', 'searching', 'offering', 'accepted', 'exhausted', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dispatch_offer_status" AS ENUM('offered', 'accepted', 'declined', 'expired', 'revoked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."geo_point_source" AS ENUM('geocode_google', 'geocode_manual', 'pincode_centroid', 'device');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "fulfillment_type" "fulfillment_type" DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "dispatch_status" "dispatch_status" DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "dispatch_exhausted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_latitude" double precision;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_longitude" double precision;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_geo_source" "geo_point_source";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_geo_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "fulfillment_type" "fulfillment_type";--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "delivery_latitude" double precision;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN IF NOT EXISTS "delivery_longitude" double precision;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "base_latitude" double precision;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "base_longitude" double precision;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "base_geo_source" "geo_point_source";--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "service_radius_km" numeric(6, 2) DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "last_offered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "instant_show_badge" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "instant_badge_label" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "instant_pdp_note" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "instant_eta_minutes" integer;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dispatch_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"round" integer DEFAULT 1 NOT NULL,
	"distance_meters" integer,
	"status" "dispatch_offer_status" DEFAULT 'offered' NOT NULL,
	"offered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"responded_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispatch_offers" ADD CONSTRAINT "dispatch_offers_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dispatch_offers" ADD CONSTRAINT "dispatch_offers_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispatch_offers_order_id_status_idx" ON "dispatch_offers" USING btree ("order_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dispatch_offers_vendor_id_offered_at_idx" ON "dispatch_offers" USING btree ("vendor_id","offered_at");
