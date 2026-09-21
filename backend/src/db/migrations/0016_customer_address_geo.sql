ALTER TABLE "customer_addresses" ADD COLUMN IF NOT EXISTS "latitude" double precision;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD COLUMN IF NOT EXISTS "longitude" double precision;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD COLUMN IF NOT EXISTS "geo_source" "geo_point_source";
